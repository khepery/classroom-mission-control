# Classroom Mission Control - local server for this folder
# Serves the hub at http://localhost:8080 so the AI tools and the microphone work,
# lets student phones on the same Wi-Fi join Quiz Show games at http://<this laptop>:8080/join
# and lets a phone scan answer cards at http://<this laptop>:8080/scan
# No admin rights needed. The first time, Windows may ask to allow access: tick Private networks and press Allow.
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8080
$host.UI.RawUI.WindowTitle = 'Classroom Mission Control'
$cs = @'
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Collections.Generic;

// Classroom Mission Control local server.
// Serves the hub folder and relays Quiz Show messages between the laptop and student phones on the same Wi-Fi.
// Written in C# 5 so Windows PowerShell 5.1 can compile it with Add-Type. No admin rights needed.
public static class McServer
{
    static string Root;
    static int Port;
    static TcpListener Listener;
    static readonly object Gate = new object();
    static string State = "null";
    static int Ver = 0;
    static List<string> Ev = new List<string>();
    static int EvBase = 0;
    static Dictionary<string, string> Blobs = new Dictionary<string, string>();
    static Dictionary<string, string> Types = new Dictionary<string, string>();

    public static bool Start(string root, int port)
    {
        Root = Path.GetFullPath(root).TrimEnd('\\', '/');
        Port = port;
        string[] t = {
            ".html","text/html; charset=utf-8", ".htm","text/html; charset=utf-8", ".js","text/javascript", ".mjs","text/javascript",
            ".css","text/css", ".json","application/json", ".wasm","application/wasm", ".woff2","font/woff2", ".woff","font/woff",
            ".png","image/png", ".jpg","image/jpeg", ".jpeg","image/jpeg", ".webp","image/webp", ".gif","image/gif", ".svg","image/svg+xml",
            ".ico","image/x-icon", ".mp4","video/mp4", ".webm","video/webm", ".mp3","audio/mpeg", ".wav","audio/wav", ".txt","text/plain; charset=utf-8", ".onnx","application/octet-stream" };
        for (int i = 0; i < t.Length; i += 2) Types[t[i]] = t[i + 1];
        try { Listener = new TcpListener(IPAddress.Any, port); Listener.Start(); return true; }
        catch { return false; }
    }

    public static void Loop()
    {
        while (true)
        {
            TcpClient c;
            try { c = Listener.AcceptTcpClient(); } catch { Thread.Sleep(50); continue; }
            ThreadPool.QueueUserWorkItem(Handle, c);
        }
    }

    public static string[] Ips()
    {
        List<string> a = new List<string>();
        try
        {
            foreach (IPAddress ip in Dns.GetHostAddresses(Dns.GetHostName()))
            {
                if (ip.AddressFamily != AddressFamily.InterNetwork) continue;
                string s = ip.ToString();
                if (s.StartsWith("127.") || s.StartsWith("169.254.")) continue;
                if (!a.Contains(s)) a.Add(s);
            }
        }
        catch { }
        a.Sort(delegate (string x, string y) { return Rank(x).CompareTo(Rank(y)); });
        return a.ToArray();
    }

    static int Rank(string s)
    {
        if (s.StartsWith("192.168.137.")) return 0; // Windows mobile hotspot
        if (s.StartsWith("192.168.")) return 1;
        if (s.StartsWith("10.")) return 2;
        if (s.StartsWith("172.")) return 3;
        return 4;
    }

    static string Q(string query, string key)
    {
        if (query == null) return "";
        foreach (string part in query.TrimStart('?').Split('&'))
        {
            int i = part.IndexOf('=');
            string k = i < 0 ? part : part.Substring(0, i);
            if (k == key) return i < 0 ? "" : Uri.UnescapeDataString(part.Substring(i + 1).Replace('+', ' '));
        }
        return "";
    }

    static string Js(string s)
    {
        StringBuilder b = new StringBuilder("\"");
        foreach (char ch in s)
        {
            if (ch == '"' || ch == '\\') b.Append('\\').Append(ch);
            else if (ch < ' ') b.Append(' ');
            else b.Append(ch);
        }
        return b.Append('"').ToString();
    }

    static void Handle(object o)
    {
        TcpClient c = (TcpClient)o;
        try
        {
            c.ReceiveTimeout = 8000;
            c.SendTimeout = 30000;
            NetworkStream s = c.GetStream();
            byte[] buf = new byte[65536];
            MemoryStream ms = new MemoryStream();
            int headEnd = -1;
            while (headEnd < 0)
            {
                int n = s.Read(buf, 0, buf.Length);
                if (n <= 0) return;
                ms.Write(buf, 0, n);
                headEnd = Find(ms.GetBuffer(), (int)ms.Length);
                if (ms.Length > 65536 && headEnd < 0) return;
            }
            byte[] all = ms.ToArray();
            string head = Encoding.ASCII.GetString(all, 0, headEnd);
            string[] lines = head.Split(new string[] { "\r\n" }, StringSplitOptions.None);
            string[] rl = lines[0].Split(' ');
            if (rl.Length < 2) return;
            string method = rl[0].ToUpperInvariant();
            string target = rl[1];
            Dictionary<string, string> h = new Dictionary<string, string>();
            for (int i = 1; i < lines.Length; i++)
            {
                int k = lines[i].IndexOf(':');
                if (k > 0) h[lines[i].Substring(0, k).Trim().ToLowerInvariant()] = lines[i].Substring(k + 1).Trim();
            }
            int len = 0;
            if (h.ContainsKey("content-length")) int.TryParse(h["content-length"], out len);
            if (len > 4000000) { Send(s, "413 Payload Too Large", "text/plain", Encoding.ASCII.GetBytes("too big"), null); return; }
            byte[] body = new byte[len];
            int have = all.Length - (headEnd + 4);
            if (have > 0) Array.Copy(all, headEnd + 4, body, 0, Math.Min(have, len));
            while (have < len)
            {
                int n = s.Read(body, have, len - have);
                if (n <= 0) break;
                have += n;
            }
            string path = target, query = "";
            int qi = target.IndexOf('?');
            if (qi >= 0) { path = target.Substring(0, qi); query = target.Substring(qi + 1); }
            path = Uri.UnescapeDataString(path);
            if (path.StartsWith("/api/")) Api(s, method, path, query, Encoding.UTF8.GetString(body));
            else Static(s, method, path, h);
        }
        catch { }
        finally { try { c.Close(); } catch { } }
    }

    static int Find(byte[] b, int n)
    {
        for (int i = 3; i < n; i++) if (b[i] == 10 && b[i - 1] == 13 && b[i - 2] == 10 && b[i - 3] == 13) return i - 3;
        return -1;
    }

    static void Json(NetworkStream s, string json) { Send(s, "200 OK", "application/json; charset=utf-8", Encoding.UTF8.GetBytes(json), null); }

    static void Api(NetworkStream s, string m, string path, string query, string body)
    {
        if (path == "/api/ping")
        {
            StringBuilder b = new StringBuilder("{\"ok\":1,\"port\":" + Port + ",\"ips\":[");
            string[] ips = Ips();
            for (int i = 0; i < ips.Length; i++) { if (i > 0) b.Append(','); b.Append(Js(ips[i])); }
            Json(s, b.Append("]}").ToString());
            return;
        }
        if (path == "/api/state")
        {
            int v; int.TryParse(Q(query, "v"), out v);
            string st; int cur;
            lock (Gate) { st = State; cur = Ver; }
            Json(s, v == cur ? "{\"v\":" + cur + "}" : "{\"v\":" + cur + ",\"s\":" + st + "}");
            return;
        }
        if (path == "/api/send" && m == "POST")
        {
            string t = body.Replace('\r', ' ').Replace('\n', ' ').Trim();
            if (t.Length < 2 || t.Length > 20000 || t[0] != '{' || t[t.Length - 1] != '}') { Send(s, "400 Bad Request", "text/plain", Encoding.ASCII.GetBytes("bad"), null); return; }
            lock (Gate)
            {
                Ev.Add(t);
                if (Ev.Count > 4000) { Ev.RemoveRange(0, 1000); EvBase += 1000; }
            }
            Json(s, "{\"ok\":1}");
            return;
        }
        if (path == "/api/blob")
        {
            string d;
            lock (Gate) { Blobs.TryGetValue(Q(query, "id"), out d); }
            if (d == null) Send(s, "404 Not Found", "text/plain", Encoding.ASCII.GetBytes("none"), null);
            else Send(s, "200 OK", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes(d), null);
            return;
        }
        if (path == "/api/host/state" && m == "POST")
        {
            string t = body.Trim();
            if (t.Length == 0 || (t[0] != '{' && t != "null")) { Send(s, "400 Bad Request", "text/plain", Encoding.ASCII.GetBytes("bad"), null); return; }
            int v;
            lock (Gate) { State = t; Ver++; v = Ver; }
            Json(s, "{\"v\":" + v + "}");
            return;
        }
        if (path == "/api/host/events")
        {
            int since; int.TryParse(Q(query, "since"), out since);
            StringBuilder b = new StringBuilder();
            lock (Gate)
            {
                int total = EvBase + Ev.Count;
                b.Append(total);
                for (int i = Math.Max(since, EvBase); i < total; i++) b.Append('\n').Append(Ev[i - EvBase]);
            }
            Send(s, "200 OK", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes(b.ToString()), null);
            return;
        }
        if (path == "/api/host/blob" && m == "POST")
        {
            string id = Q(query, "id");
            if (id.Length == 0 || id.Length > 40) { Send(s, "400 Bad Request", "text/plain", Encoding.ASCII.GetBytes("bad"), null); return; }
            lock (Gate) { Blobs[id] = body; }
            Json(s, "{\"ok\":1}");
            return;
        }
        if (path == "/api/host/reset" && m == "POST")
        {
            lock (Gate) { Ev.Clear(); EvBase = 0; Blobs.Clear(); State = "null"; Ver++; }
            Json(s, "{\"ok\":1}");
            return;
        }
        Send(s, "404 Not Found", "text/plain", Encoding.ASCII.GetBytes("no such api"), null);
    }

    static void Static(NetworkStream s, string method, string path, Dictionary<string, string> h)
    {
        if (path == "/" || path == "") path = "/index.html";
        if (path == "/join" || path == "/join/") path = "/join.html";
        if (path == "/scan" || path == "/scan/") path = "/scan.html";
        string file;
        try { file = Path.GetFullPath(Path.Combine(Root, path.TrimStart('/').Replace('/', Path.DirectorySeparatorChar))); }
        catch { Send(s, "400 Bad Request", "text/plain", Encoding.ASCII.GetBytes("bad path"), null); return; }
        if (!file.StartsWith(Root + Path.DirectorySeparatorChar) || !File.Exists(file))
        {
            Send(s, "404 Not Found", "text/plain", Encoding.ASCII.GetBytes("not found"), null);
            return;
        }
        string ext = Path.GetExtension(file).ToLowerInvariant();
        string type = Types.ContainsKey(ext) ? Types[ext] : "application/octet-stream";
        using (FileStream f = new FileStream(file, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
        {
            long size = f.Length, from = 0, to = size - 1;
            string status = "200 OK", extra = "Accept-Ranges: bytes\r\n";
            string range;
            if (h.TryGetValue("range", out range) && range.StartsWith("bytes="))
            {
                string[] p = range.Substring(6).Split(',')[0].Split('-');
                long a, b;
                if (p[0].Length > 0 && long.TryParse(p[0], out a)) { from = a; if (p.Length > 1 && long.TryParse(p[1], out b)) to = Math.Min(b, size - 1); }
                else if (p.Length > 1 && long.TryParse(p[1], out b)) { from = Math.Max(0, size - b); }
                if (from > to || from >= size) { Send(s, "416 Range Not Satisfiable", "text/plain", new byte[0], "Content-Range: bytes */" + size + "\r\n"); return; }
                status = "206 Partial Content";
                extra += "Content-Range: bytes " + from + "-" + to + "/" + size + "\r\n";
            }
            long count = to - from + 1;
            string head = "HTTP/1.1 " + status + "\r\nContent-Type: " + type + "\r\nContent-Length: " + count + "\r\nCache-Control: no-cache\r\nConnection: close\r\n" + extra + "\r\n";
            byte[] hb = Encoding.ASCII.GetBytes(head);
            s.Write(hb, 0, hb.Length);
            if (method == "HEAD") return;
            f.Seek(from, SeekOrigin.Begin);
            byte[] buf = new byte[262144];
            while (count > 0)
            {
                int n = f.Read(buf, 0, (int)Math.Min(buf.Length, count));
                if (n <= 0) break;
                s.Write(buf, 0, n);
                count -= n;
            }
        }
    }

    static void Send(NetworkStream s, string status, string type, byte[] body, string extra)
    {
        string head = "HTTP/1.1 " + status + "\r\nContent-Type: " + type + "\r\nContent-Length: " + body.Length + "\r\nCache-Control: no-store\r\nConnection: close\r\n" + (extra ?? "") + "\r\n";
        byte[] hb = Encoding.ASCII.GetBytes(head);
        s.Write(hb, 0, hb.Length);
        if (body.Length > 0) s.Write(body, 0, body.Length);
    }
}

'@
try { Add-Type -TypeDefinition $cs -Language CSharp -ErrorAction Stop }
catch { Write-Host "The hub could not start: $($_.Exception.Message)"; Read-Host "Press Enter to close"; exit }
if (-not [McServer]::Start($root, $port)) {
  Write-Host "Port $port is busy. Close the other window running the hub and try again."
  Read-Host "Press Enter to close"; exit
}
$ips = [McServer]::Ips()
Write-Host ""
Write-Host "  CLASSROOM MISSION CONTROL IS RUNNING" -ForegroundColor Yellow
Write-Host ""
Write-Host "  On this laptop:  http://localhost:$port"
if ($ips.Length -gt 0) {
  Write-Host "  Student phones:  http://$($ips[0]):$port/join   (same Wi-Fi as this laptop)" -ForegroundColor Cyan
  for ($i = 1; $i -lt $ips.Length; $i++) { Write-Host "  Other address:   http://$($ips[$i]):$port/join" }
} else {
  Write-Host "  No Wi-Fi network found. Connect to the classroom Wi-Fi, or turn on Mobile hotspot, then restart this window."
}
Write-Host ""
Write-Host "  Keep this window open while you teach. Close it to stop."
Write-Host "  Phones cannot connect? Double-click 'Allow phones.bat' once, or turn on Mobile hotspot and let phones join it."
Start-Process "http://localhost:$port/index.html"
[McServer]::Loop()
