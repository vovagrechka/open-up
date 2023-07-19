using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Antiforgery;
using IoFile = System.IO.File;

namespace open_up {
    [ApiController]
    [Route("[controller]/[action]")]
    public class PileController : ControllerBase {
        IWebHostEnvironment env;

        public PileController(IWebHostEnvironment env) {
            this.env = env;
        }

        public string FindTextInWebStorm(string text) {
            // Use ripgrep
            string output;
            {
                var proc = new Process {
                    StartInfo = {
                        FileName = "rg",
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        ArgumentList = {
                            "--regexp", Regex.Escape(text).Replace("\\ ", "\\s+"),
                            "--case-sensitive", "--multiline", "--column", "--json",
                            @"C:\deluxe\repo\orders-ui-2\docs\tasks-docs"
                        }
                    }
                };

                proc.Start();
                output = proc.StandardOutput.ReadToEnd();
                proc.WaitForExit();
            }

            string? matchJson = null;

            foreach (var _json in output.Split('\n')) {
                var json = _json.Trim();
                if (json.StartsWith("{\"type\":\"match\"")) {
                    if (matchJson != null)
                        return "Error: Several matches";

                    matchJson = json;
                }
            }

            if (matchJson == null)
                return "Error: No matches";

            var data = JsonSerializer.Deserialize<JqMatchResponse>(matchJson,
                new JsonSerializerOptions {IncludeFields = true});
            if (data == null)
                return "Error: Failed to deserialize JSON output from ripgrep";

            var file = data.data.path.text;
            var line = data.data.line_number;
            var column = data.data.submatches[0].start + 1;
            NavigateWebStormToFilePosition(file, line, column);
            ActivateWebStorm();

            return "OK";
        }

        private void NavigateWebStormToFilePosition(string file, int line, int column) {
            var proc = new Process {
                StartInfo = new() {FileName = @"C:\Program Files\JetBrains\WebStorm 2023.1\bin\webstorm64.exe"}
            };
            foreach (var x in new[] {
                         "--line", "" + line,
                         "--column", "" + (column - 1),
                         file
                     }) {
                proc.StartInfo.ArgumentList.Add(x);
            }
            proc.Start();
        }

        public string OpenWebStorm(string file, int line, int column) {
            NavigateWebStormToFilePosition(file, line, column);
            ActivateWebStorm();
            return "OK";
        }

        private void ActivateWebStorm() {
            var scriptFile = Path.GetTempPath() + "/3BDB7818-842E-40C7-96AF-21A464254445";
            IoFile.WriteAllText(scriptFile, @"
                    WinActivate('ahk_exe webstorm64.exe')
                ");
            var proc = new Process {
                StartInfo = new() {FileName = @"C:\store\git\bits\1\app\AutoHotkey_2.0.2\AutoHotkey64.exe"}
            };
            proc.StartInfo.ArgumentList.Add(scriptFile);
            proc.Start();
        }
    }
}

public class JqMatchResponse {
    public string type;
    public Data data;

    public class Data {
        public Path path;
        public int line_number;
        public List<SubMatch> submatches;

        public class Path {
            public string text;
        }

        public class SubMatch {
            public Match match;
            public int start;
            public int end;

            public class Match {
                public string text;
            }
        }
    }
}
