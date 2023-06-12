using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Text.RegularExpressions;
using IoFile = System.IO.File;

namespace open_up
{
    [ApiController]
    [Route("[controller]/[action]")]
    public class PileController : ControllerBase
    {
        IWebHostEnvironment env;

        public PileController(IWebHostEnvironment env)
        {
            this.env = env;
        }

        public string OpenWebStorm(string file, int line, int column)
        {
            var filePath = file;
            //if (!Regex.IsMatch(filePath, @"^\w:[\\/]"))
            //{
            //    var projectDir = @"C:\repo\one-tasks\src\Deluxe.OneTasks.UI\www";
            //    filePath = projectDir + "/src/" + file;
            //}

            // Ask WebStorm to navigate to the file position
            {
                var proc = new Process
                {
                    // StartInfo = new() { FileName = @"C:\Program Files\JetBrains\WebStorm 2021.3.1\bin\webstorm64.exe" }
                    // StartInfo = new() { FileName = @"C:\Program Files (x86)\JetBrains\WebStorm 2021.3.2\bin\webstorm64.exe" }
                    // StartInfo = new() { FileName = @"C:\Program Files\JetBrains\WebStorm 2021.3.3\bin\webstorm64.exe" }
                    StartInfo = new() {FileName = @"C:\Program Files\JetBrains\WebStorm 2023.1\bin\webstorm64.exe"}
                };
                foreach (var x in new[]
                         {
                             "--line", "" + line,
                             "--column", "" + (column - 1),
                             filePath
                         })
                {
                    proc.StartInfo.ArgumentList.Add(x);
                }
                proc.Start();
            }

            // Activate WebStorm window
            {
                var scriptFile = Path.GetTempPath() + "/3BDB7818-842E-40C7-96AF-21A464254445";
                IoFile.WriteAllText(scriptFile, @"
                    WinActivate('ahk_exe webstorm64.exe')
                ");
                var proc = new Process
                {
                    StartInfo = new() {FileName = @"C:\store\git\bits\1\app\AutoHotkey_2.0.2\AutoHotkey64.exe"}
                };
                proc.StartInfo.ArgumentList.Add(scriptFile);
                proc.Start();
            }

            return "OK";
        }
    }
}