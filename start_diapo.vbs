' --- start_diapo.vbs ---
' Run by the Desktop shortcut made by install.js: starts node_diapo with no
' window, which a .bat cannot do. Its first argument is the absolute path of
' node.exe. The server's output goes to logs\node_diapo.log, started afresh
' each time, and shows in the page with Ctrl+Shift+D. start_diapo.bat, which
' keeps a window, remains for looking into a server that does not start.
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
shell.CurrentDirectory = fso.GetParentFolderName(WScript.ScriptFullName)
If Not fso.FolderExists("logs") Then fso.CreateFolder("logs")
node = "node"
If WScript.Arguments.Count > 0 Then node = WScript.Arguments(0)
shell.Run "cmd /c """"" & node & """ html_app.js > logs\node_diapo.log 2>&1""", 0, False
