
    const terminal = document.getElementById("terminal");
    const bootTime = Date.now();

    let users = JSON.parse(localStorage.getItem('mehmetos_users')) || {
        "root": { password: "root", home: "/root" },
        "mehmet": { password: "1234", home: "/home/user" }
    };
    let currentUser = "mehmet";
    let systemHostname = localStorage.getItem('mehmetos_hostname') || "mhtos";

    let vfs = JSON.parse(localStorage.getItem('mehmetos_vfs'));
    if (!vfs) {
        vfs = {
            type: "dir",
            content: {
                "bin": { type: "dir", content: {} },
                "boot": { type: "dir", content: {} },
                "dev": { type: "dir", content: {} },
                "etc": { type: "dir", content: {} },
                "home": {
                    type: "dir",
                    content: {
                        "user": {
                            type: "dir",
                            content: {
                                "Documents": { type: "dir", content: {} },
                                "Downloads": { type: "dir", content: {} },
                                "readme.txt": { type: "file", content: "MehmetOS'a hos geldin! Bu dosya localStorage ile kaydedildi." }
                            }
                        }
                    }
                },
                "lib": { type: "dir", content: {} },
                "media": { type: "dir", content: {} },
                "mnt": { type: "dir", content: {} },
                "opt": { type: "dir", content: {} },
                "proc": { type: "dir", content: {} },
                "root": { type: "dir", content: {} },
                "run": { type: "dir", content: {} },
                "srv": { type: "dir", content: {} },
                "sys": { type: "dir", content: {} },
                "tmp": { type: "dir", content: {} },
                "usr": { type: "dir", content: {} },
                "var": { type: "dir", content: {} }
            }
        };
        saveVFS();
    }
    
    let currentPath = ["home", "user"];
    let filePermissions = JSON.parse(localStorage.getItem('mehmetos_perms')) || {};
    let commandHistory = [];
    let historyIndex = -1;
    let aliases = JSON.parse(localStorage.getItem('mehmetos_aliases')) || {};

    function saveVFS() {
        localStorage.setItem('mehmetos_vfs', JSON.stringify(vfs));
    }

    function saveUsers() {
        localStorage.setItem('mehmetos_users', JSON.stringify(users));
    }

    function saveAliases() {
        localStorage.setItem('mehmetos_aliases', JSON.stringify(aliases));
    }

    function savePermissions() {
        localStorage.setItem('mehmetos_perms', JSON.stringify(filePermissions));
    }

    function saveHostname() {
        localStorage.setItem('mehmetos_hostname', systemHostname);
    }

    function escapeHtml(text) {
        let div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function resolvePath(targetStr) {
        if (!targetStr) return currentPath;
        let parts = targetStr.split('/').filter(p => p !== '');
        let newPath = targetStr.startsWith('/') ? [] : [...currentPath];

        for (let p of parts) {
            if (p === '.') continue;
            if (p === '..') {
                if (newPath.length > 0) newPath.pop();
            } else {
                newPath.push(p);
            }
        }
        return newPath;
    }

    function getNode(pathArr) {
        let curr = vfs;
        for (let p of pathArr) {
            if (curr.type !== 'dir' || !curr.content[p]) return null;
            curr = curr.content[p];
        }
        return curr;
    }

    function getPermissions(pathArr) {
        let key = pathArr.join('/');
        return filePermissions[key] || { mode: '755', owner: 'mehmet', group: 'mehmet' };
    }

    function setPermissions(pathArr, mode, owner, group) {
        let key = pathArr.join('/');
        filePermissions[key] = { mode: mode, owner: owner || 'mehmet', group: group || 'mehmet' };
        savePermissions();
    }

    function print(text, isHtml = false) {
        let div = document.createElement("div");
        if (isHtml) {
            div.innerHTML = text;
        } else {
            div.textContent = text;
        }
        terminal.appendChild(div);
        window.scrollTo(0, document.body.scrollHeight);
    }

    function getUptime() {
        let up = Math.floor((Date.now() - bootTime) / 1000);
        let h = Math.floor(up / 3600);
        let m = Math.floor((up % 3600) / 60);
        let s = up % 60;
        return `${h}h ${m}m ${s}s`;
    }

const grubScreen = `
<div id="grub">
    <div style="text-align:center; color: #8ae234; font-size: 18px; margin-bottom: 12px;">GNU GRUB version 2.12</div>
    <div style="background-color: #1a1a1a; padding: 8px; border-radius: 8px;">
        <div class="grub-highlight" style="margin: 2px 0; cursor: pointer;" id="boot-normal"> *MehmetOS GNU/Linux</div>
        <div style="margin: 2px 0; color: #aaa; cursor: pointer;" id="boot-safe">  MehmetOS GNU/Linux (Safe Mode)</div>
    </div>
    ...
`;


    const bootLogs = [
        "Loading MehmetOS GNU/Linux...",
        "Loading initial ramdisk...",
        "",
        "[    0.000000] Linux version 6.18-mehmetos",
        "[    0.015201] x86/fpu: Supporting XSAVE feature",
        "[    0.022188] BIOS-provided physical RAM map:",
        "[    0.038112] Reserving Intel graphics memory",
        "[    0.054201] ACPI: Early table checksum verification disabled",
        "[    0.070443] Detected 8 CPU cores",
        "[    0.088145] Initializing scheduler",
        "[    0.101992] Loading kernel modules",
        "[    0.145331] Starting systemd 257",
        "[  OK  ] Mounted /boot",
        "[  OK  ] Mounted /home",
        "[  OK  ] Started Journal Service",
        "[  OK  ] Started Network Manager",
        "[FAILED] Failed to start Bluetooth Service",
        "[DEPEND] Dependency failed for Bluetooth Support",
        "[  OK  ] Started Login Service",
        "[  OK  ] Reached Multi-User Target",
        "[  OK  ] Reached Graphical Target",
        "[    0.181220] PCI: Probing PCI hardware",
"[    0.198445] PCI: Using configuration type 1",
"[    0.215672] ACPI: Interpreter enabled",
"[    0.233045] ACPI: Enabled 5 GPEs in block 00 to 3F",
"[    0.250112] SCSI subsystem initialized",
"[    0.267349] libata version 3.00 loaded",
"[    0.284123] usbcore: registered new interface driver usbfs",
"[    0.301456] usbcore: registered new interface driver hub",
"[    0.318234] usbcore: registered new device driver usb",
"[    0.335112] i8042: PNP: PS/2 Controller [PNP0303]",
"[    0.352001] i8042: Detected active multiplexing controller",
"[    0.369234] serio: i8042 KBD port at 0x60,0x64 irq 1",
"[    0.386112] serio: i8042 AUX port at 0x60,0x64 irq 12",
"[    0.403445] mousedev: PS/2 mouse device common for all mice",
"[    0.420671] rtc_cmos 00:04: RTC can wake from S4",
"[    0.437891] rtc_cmos 00:04: registered as rtc0",
"[    0.454112] rtc_cmos 00:04: setting system clock to 2026-06-21",
"[    0.471234] ... done.",
"[    0.488445] Freeing unused kernel memory: 2048K",
"[    0.505671] Run /init as init process",
"[    0.522891] init: Starting systemd 257",
"[    0.540112] systemd[1]: systemd 257 running in system mode",
"[    0.557334] systemd[1]: Detected architecture x86-64",
"[    0.574556] systemd[1]: Set hostname to <mehmetos>",
"[    0.591778] systemd[1]: Initializing machine ID",
"[    0.608999] systemd[1]: Starting udev Kernel Device Manager",
"[    0.626221] systemd[1]: Started udev Kernel Device Manager",
"[    0.643443] systemd[1]: Mounting /sys/kernel/config",
"[    0.660664] systemd[1]: Mounted /sys/kernel/config",
"[    0.677886] systemd[1]: Starting Journal Service",
"[    0.695107] systemd[1]: Started Journal Service",
"[    0.712329] systemd[1]: Starting Network Manager",
"[    0.729550] systemd[1]: Started Network Manager",
"[    0.746772] systemd[1]: Reached target Network",
"[    0.763994] systemd[1]: Starting Login Service",
"[    0.781215] systemd[1]: Started Login Service",
"[    0.798437] systemd[1]: Reached target Multi-User System",
"[    0.815658] systemd[1]: Reached target Graphical Interface",
        "[    0.998001] Kernel panic - not syncing: VFS: Unable to mount root fs",
"[    1.002334] ---[ end Kernel panic - not syncing ]---",
"[    1.015667] Rebooting in 5 seconds...",
"[    1.032001] ACPI: Preparing to enter system sleep state S5",
"[    1.048334] systemd-shutdown[1]: Sending SIGTERM to remaining processes",
"[    1.065667] systemd-journald[102]: Journal stopped",
"[    1.082001] systemd-shutdown[1]: Sending SIGKILL to remaining processes",
"[    1.098334] systemd-shutdown[1]: Unmounting file systems.",
"[    1.115667] EXT4-fs (sda1): unmounting filesystem.",
"[    1.132001] systemd-shutdown[1]: All filesystems unmounted.",
"[    1.148334] systemd-shutdown[1]: Deactivating swaps.",
"[    1.165667] systemd-shutdown[1]: All swaps deactivated.",
"[    1.182001] systemd-shutdown[1]: Powering off.",
"[    1.198334] ACPI: Powering off.",
"",
"[    1.215667] UEFI Secure Boot: enabled",
"[    1.232001] Trusted Platform Module (TPM): initialized",
"[    1.248334] Intel(R) Management Engine Interface: MEI driver",
"[    1.265667] iTCO_wdt: Intel TCO WatchDog Timer",
"[    1.282001] iTCO_wdt: initialized. heartbeat=30 sec",
"[    1.298334] ACPI: Added _OSI(Module Device)",
"[    1.315667] ACPI: Added _OSI(Processor Device)",
"[    1.332001] ACPI: Added _OSI(3.0 _SCP Extensions)",
"[    1.348334] ACPI: Added _OSI(Processor Aggregator Device)",
"[    1.365667] ACPI: EC: EC started",
"[    1.382001] ACPI: EC: interrupt blocked",
"[    1.398334] ACPI: EC: EC_CMD/EC_SC=0x66, EC_DATA=0x62",
"[    1.415667] ACPI: EC: Boot ECDT EC used to handle transactions",
"[    1.432001] ACPI: Interpreter enabled",
"[    1.448334] ACPI: Enabled 8 GPEs in block 00 to 3F",
"[    1.465667] ACPI: Power Resource [CPU0] (on)",
"[    1.482001] ACPI: Power Resource [CPU1] (on)",
"[    1.498334] ACPI: Power Resource [CPU2] (on)",
"[    1.515667] ACPI: Power Resource [CPU3] (on)",
        "",
        "MehmetOS GNU/Linux login"
    ];

    let logIndex = 0;

    function colorizeLog(line) {
    line = line.replace(/(\[\s*\d+\.\d+\])/g, '<span style="color: #78909c;">$1</span>');
    line = line.replace(/\[  OK  \]/g, '[  <span class="ok">OK</span>  ]');
    line = line.replace(/\[FAILED\]/g, '[<span class="failed">FAILED</span>]');
    line = line.replace(/\[DEPEND\]/g, '[<span class="depend">DEPEND</span>]');
    return line;
    }

function startBootLogs() {
    if (logIndex < bootLogs.length) {
        let randomPanic = Math.random();
        if (logIndex > 15 && logIndex < 35 && randomPanic < 0.01) {
            print(colorizeLog("[    0.999999] Kernel panic(That's okay, dear :) (It will start and open again now, don't worry.) - not syncing: Fatal exception in interrupt"), true);
            print(colorizeLog("[    1.000001] CPU: 0 PID: 1 Comm: swapper/0 Not tainted 6.18-mehmetos"), true);
            print(colorizeLog("[    1.000002] Hardware name: MehmetOS Virtual Machine"), true);
            print(colorizeLog("[    1.000003] RIP: 0010:do_exit+0x2a/0x8c0"), true);
            print(colorizeLog("[    1.000004] Code: 48 8b 7c 24 08 48 89 de e8 5e 0b 00 00 48 89 df e8 56"), true);
            print(colorizeLog("[    1.000005] Call Trace:"), true);
            print(colorizeLog("[    1.000006]  <TASK>"), true);
            print(colorizeLog("[    1.000007]  ? panic+0x1a/0x2a"), true);
            print(colorizeLog("[    1.000008]  ? do_exit+0x2a/0x8c0"), true);
            print(colorizeLog("[    1.000009]  ? syscall_exit_to_user_mode+0x1a/0x2a"), true);
            print(colorizeLog("[    1.000010]  </TASK>"), true);
            print(colorizeLog("[    1.000011] Kernel panic - not syncing: Fatal exception"), true);
            print(colorizeLog("[    1.000012] ---[ end Kernel panic - not syncing ]---"), true);
            print(colorizeLog("[    1.000013] Rebooting in 2 seconds..."), true);
            setTimeout(() => {
                terminal.innerHTML = "";
                logIndex = 0;
                startBootLogs();
            }, 2000);
            return;
        }
        print(colorizeLog(bootLogs[logIndex]), true);
        logIndex++;
        let delay = Math.random() * 150 + 50;
        if (logIndex > 10 && logIndex < 20) {
            delay = Math.random() * 200 + 150;
        } else if (logIndex > 30 && logIndex < 40) {
            delay = Math.random() * 300 + 200;
        } else if (logIndex > 50) {
            delay = Math.random() * 150 + 80;
        } else if (logIndex === bootLogs.length - 1) {
            delay = 400;
        }
        setTimeout(startBootLogs, delay);
    } else {
        let bootTimeSeconds = ((Date.now() - bootTime) / 1000).toFixed(2);
        setTimeout(() => {
            terminal.innerHTML = "";
            startTerminal(bootTimeSeconds);
        }, 500);
    }
}
function init() {
    terminal.innerHTML = grubScreen;
    document.getElementById("boot-normal").onclick = function() {
    clearInterval(timer);
    terminal.innerHTML = "";
    startBootLogs(); // Normal başlatma
};

document.getElementById("boot-safe").onclick = function() {
    clearInterval(timer);
    terminal.innerHTML = "";
    currentUser = "root";
    currentPath = ["root"]; 
    startTerminal(); 
};
    
    let sec = 3;
    let timer;


    timer = setInterval(() => {
        sec--;
        let secEl = document.getElementById("grub-sec");
        if (secEl) secEl.innerText = sec;
        
        if (sec <= 0) {
            clearInterval(timer);
            terminal.innerHTML = "";
            startBootLogs();
        }
    }, 1000);
}

function startTerminal() {
    print("<br>Welcome to MehmetOS GNU/Linux!", true);
    print("Type 'help' for a list of available commands.<br>", true);
    print("The technical maintenance, updates, and sustainability processes of this website are managed partially or fully by @DigitalShadows659 and @mehmetos via GitHub.<br>", true);
    print("Bu web sitesinin teknik bakım, güncelleme ve sürdürülebilirlik süreçleri, GitHub üzerinden @DigitalShadows659 ve @mehmetos tarafından kısmi veya tam yetkiyle yürütülmektedir.<br>",  true);
    newInput();
}


    function getPromptString() {
        let displayPath = "/" + currentPath.join("/");
        let homePath = users[currentUser]?.home || "/home/" + currentUser;
        if (displayPath.startsWith(homePath)) {
            displayPath = displayPath.replace(homePath, "~");
        }
        let userColor = currentUser === 'root' ? 'root' : 'user';
        return `<span class="${userColor}">${currentUser}@${systemHostname}</span>:<span class="path">${displayPath}</span>$ `;
    }

    function newInput() {
        let row = document.createElement("div");
        row.className = "prompt-line";

        let text = document.createElement("span");
        text.className = "prompt-text";
        text.innerHTML = getPromptString();

        let input = document.createElement("input");
        input.type = "text";
        input.autocomplete = "off";
        input.spellcheck = false;

        row.appendChild(text);
        row.appendChild(input);
        terminal.appendChild(row);

        input.focus();
        window.scrollTo(0, document.body.scrollHeight);

        document.onclick = () => input.focus();

        input.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                let value = input.value.trim();
                input.disabled = true;
                
                if (value !== "") {
                    commandHistory.push(value);
                    historyIndex = commandHistory.length;
                }
                
                runCommand(value);
            } 
            else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    input.value = commandHistory[historyIndex];
                }
            } 
            else if (e.key === "ArrowDown") {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    input.value = commandHistory[historyIndex];
                } else {
                    historyIndex = commandHistory.length;
                    input.value = "";
                }
            }
            else if (e.key === "Tab") {
                e.preventDefault();
                let cmd = input.value.trim();
                let keys = Object.keys(commands);
                let matches = keys.filter(k => k.startsWith(cmd));
                if (matches.length === 1) {
                    input.value = matches[0];
                } else if (matches.length > 1) {
                    print(matches.join(' '), true);
                }
            }
        });
    }

    const commands = {
        help() {
            print("Available commands:");
            print("  ls       - List directory contents");
            print("  cd       - Change directory");
            print("  pwd      - Print working directory");
            print("  mkdir    - Create a directory");
            print("  touch    - Create an empty file");
            print("  cat      - Read a file");
            print("  rm       - Remove a file or directory");
            print("  cp       - Copy a file or directory");
            print("  mv       - Move or rename a file/directory");
            print("  echo     - Print text or write to file");
            print("  whoami   - Show current user");
            print("  id       - Show user identity");
            print("  useradd  - Create a new user");
            print("  passwd   - Change password");
            print("  su       - Switch user");
            print("  chmod    - Change file permissions");
            print("  chown    - Change file owner");
            print("  sudo     - Execute as root");
            print("  alias    - Create an alias");
            print("  history  - Show command history");
            print("  uptime   - Show system uptime");
            print("  hostname - Show/hostname");
            print("  neofetch - System information");
            print("  clear    - Clear the terminal");
            print("  reboot   - Restart the system");
            print("  cowsay   - Make a cow say something");
            print("  fortune  - Show a fortune");
            print("  uname    - Show system information");
            print("  sl       - Show a train (choo,choo!");
            print("  Date     - Show a current date "); 
            print("  medit    - Edit your files(my English is not good) ");
            print("  mainsite  - This redirects to our main site.")

  
        },

        pwd() {
            print("/" + currentPath.join("/"));
        },

        hostname(args) {
            if (args[1]) {
                systemHostname = args[1];
                saveHostname();
                print(`Hostname changed to '${systemHostname}'`);
            } else {
                print(systemHostname);
            }
        },
                grep(args, inputData) {
            if (!args[1]) {
                print("grep: missing pattern");
                return;
            }

            let pattern = args[1];
            let sourceText = "";

            if (args[2]) {
                let targetPath = resolvePath(args[2]);
                let node = getNode(targetPath);
                if (!node || node.type !== 'file') {
                    print(`grep: ${args[2]}: No such file`);
                    return;
                }
                sourceText = node.content;
            } else if (inputData) {
                sourceText = inputData;
            } else {
                return;
            }

            let lines = sourceText.split('\n');
            let matches = [];

            for (let line of lines) {
                if (line.includes(pattern)) {
                    let highlighted = line.split(pattern).join(`<span style="color: #ef2929; font-weight: bold;">${pattern}</span>`);
                    matches.push(highlighted);
                }
            }

            if (matches.length > 0) {
                print(matches.join('\n'), true);
            }
        },
        
date() {
    let now = new Date();
    let options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    };
    print(now.toLocaleString('en-US', options));
},
        sl() {
    let train = [
        "        🚂 CHOO CHOO!",
        "    ___________",
        "   /           |",
        "  |  O  O  O  |",
        "  |  O  O  O  |",
        "  |___________|",
        "   \\_________/",
        "",
        "   🚃🚃🚃🚃🚃🚃"
    ];
    for (let line of train) {
        print(line);
    }
},
        whoami() {
            print(currentUser);
        },

        id() {
            print(`uid=1000(${currentUser}) gid=1000(${currentUser}) groups=1000(${currentUser}),4(adm),27(sudo)`);
        },

        uptime() {
            print(`up ${getUptime()}, 1 user, load average: 0.00, 0.01, 0.05`);
        },

        ls(args) {
            let targetPath = args[1] ? resolvePath(args[1]) : currentPath;
            let node = getNode(targetPath);
            if (node && node.type === 'dir') {
                let output = "";
                for (let key in node.content) {
                    let cType = node.content[key].type;
                    if (cType === 'dir') output += `<span class="dir">${escapeHtml(key)}</span>  `;
                    else output += `<span class="file">${escapeHtml(key)}</span>  `;
                }
                if (output !== "") print(output, true);
            } else {
                print(`ls: cannot access '${args[1]}': No such file or directory`);
            }
        },

        cd(args) {
            if (!args[1]) {
                let homePath = users[currentUser]?.home || "/home/" + currentUser;
                currentPath = homePath.split('/').filter(p => p);
                if (currentPath.length === 0) currentPath = [""];
            } else {
                let targetPath = resolvePath(args[1]);
                let targetNode = getNode(targetPath);
                if (targetNode && targetNode.type === 'dir') {
                    currentPath = targetPath;
                } else if (targetNode && targetNode.type === 'file') {
                    print(`bash: cd: ${args[1]}: Not a directory`);
                } else {
                    print(`bash: cd: ${args[1]}: No such file or directory`);
                }
            }
        },

        mkdir(args) {
            if (!args[1]) {
                print("mkdir: missing operand");
            } else {
                let mNode = getNode(currentPath);
                if (mNode.content[args[1]]) {
                    print(`mkdir: cannot create directory '${args[1]}': File exists`);
                } else {
                    mNode.content[args[1]] = { type: "dir", content: {} };
                    setPermissions(currentPath.concat(args[1]), '755', currentUser, currentUser);
                    saveVFS();
                }
            }
        },

        touch(args) {
            if (!args[1]) {
                print("touch: missing file operand");
            } else {
                let tNode = getNode(currentPath);
                if (!tNode.content[args[1]]) {
                    tNode.content[args[1]] = { type: "file", content: "" };
                    setPermissions(currentPath.concat(args[1]), '644', currentUser, currentUser);
                    saveVFS();
                }
            }
        },
medit(args) {
    if (!args[1]) {
        print("medit: missing file operand. Example: medit notes.txt");
        return;
    }

    let filename = args[1];
    let targetPath = resolvePath(filename);
    let node = getNode(targetPath);

    if (node && node.type === 'dir') {
        print(`medit: '${filename}' is a directory.`);
        return;
    }

    // Terminal input'unu devre dışı bırak
    let terminalInputs = document.querySelectorAll('.prompt-line input');
    terminalInputs.forEach(inp => inp.disabled = true);

    // Editör modalını oluştur
    let editorModal = document.createElement("div");
    editorModal.id = "text-editor";
    editorModal.style.cssText = "display: flex; position: fixed; top: 10%; left: 10%; width: 80%; height: 80%; background: #222; border: 2px solid #8ae234; border-radius: 8px; z-index: 9999; flex-direction: column; padding: 10px;";

    let header = document.createElement("div");
    header.style.cssText = "display: flex; justify-content: space-between; color: #8ae234; margin-bottom: 5px; font-family: monospace;";

    let title = document.createElement("span");
    title.textContent = `Editing File: ${filename}`;

    let closeBtn = document.createElement("span");
    closeBtn.textContent = "[X]";
    closeBtn.style.cssText = "cursor: pointer; color: #ff5555; font-weight: bold;";

    header.appendChild(title);
    header.appendChild(closeBtn);

    let textarea = document.createElement("textarea");
    textarea.style.cssText = "flex: 1; background: #111; color: #fff; border: 1px solid #444; font-family: monospace; font-size: 16px; padding: 10px; resize: none; outline: none;";
    textarea.value = node ? node.content : "";

    let footer = document.createElement("div");
    footer.style.cssText = "display: flex; gap: 10px; margin-top: 10px;";

    let saveBtn = document.createElement("button");
    saveBtn.textContent = "SAVE";
    saveBtn.style.cssText = "flex: 1; background: #8ae234; color: #000; border: none; padding: 10px; font-weight: bold; border-radius: 4px; cursor: pointer;";

    footer.appendChild(saveBtn);
    editorModal.appendChild(header);
    editorModal.appendChild(textarea);
    editorModal.appendChild(footer);

    document.body.appendChild(editorModal);

    // Textarea'ya odaklan
    setTimeout(() => textarea.focus(), 100);

    // Editörü kapatınca terminal input'unu tekrar aktif et
    function closeEditor() {
        editorModal.remove();
        terminalInputs.forEach(inp => inp.disabled = false);
        let lastInput = document.querySelector('.prompt-line input:not([disabled])');
        if (lastInput) lastInput.focus();
        newInput();
    }

    saveBtn.onclick = function() {
        let currentText = textarea.value;
        let parentNode = getNode(targetPath.slice(0, -1));
        let fname = targetPath[targetPath.length - 1];

        if (parentNode && parentNode.type === 'dir') {
            parentNode.content[fname] = { type: "file", content: currentText };
            saveVFS();
            print(`'${filename}' saved successfully.`);
            closeEditor();
        } else {
            print("medit: Target directory path not found.");
            closeEditor();
        }
    };

    closeBtn.onclick = closeEditor;

    // Editörün dışına tıklanınca kapanmasın (sadece butonla kapansın)
    editorModal.addEventListener('click', function(e) {
        if (e.target === editorModal) {
            e.stopPropagation();
        }
    });
    },
        cat(args) {
            if (!args[1]) {
                print("cat: missing file operand");
            } else {
                let targetPathCat = resolvePath(args[1]);
                let cNode = getNode(targetPathCat);
                if (cNode && cNode.type === 'file') {
                    print(cNode.content);
                } else if (cNode && cNode.type === 'dir') {
                    print(`cat: ${args[1]}: Is a directory`);
                } else {
                    print(`cat: ${args[1]}: No such file or directory`);
                }
            }
        },
                 rm(args) {
            if (!args[1]) {
                print("rm: missing operand");
                return;
            }

            let recursive = false;
            let force = false;
            let interactive = false;
            let targets = [];

            for (let i = 1; i < args.length; i++) {
                let arg = args[i];
                if (arg.startsWith('-') && arg !== '-') {
                    for (let char of arg.slice(1)) {
                        if (char === 'r' || char === 'R') recursive = true;
                        else if (char === 'f') force = true;
                        else if (char === 'i') interactive = true;
                    }
                } else {
                    targets.push(arg);
                }
            }

            if (targets.length === 0) {
                if (force) return;
                print("rm: missing operand");
                return;
            }

            let currentDirNode = getNode(currentPath);
            if (!currentDirNode || currentDirNode.type !== 'dir') return;

            let finalTargets = [];

            for (let t of targets) {
                if (t.includes('*')) {
                    let regexStr = "^" + t.replace(/\*/g, ".*") + "$";
                    let regex = new RegExp(regexStr);
                    
                    for (let key in currentDirNode.content) {
                        if (regex.test(key)) {
                            finalTargets.push(t.startsWith('/') ? '/' + key : key);
                        }
                    }
                } else {
                    finalTargets.push(t);
                }
            }

            if (finalTargets.length === 0) {
                if (!force) print("rm: no matches found");
                return;
            }

            let removeTarget = function(idx) {
                if (idx >= finalTargets.length) {
                    saveVFS();
                    return;
                }

                let targetStr = finalTargets[idx];
                let targetPath = resolvePath(targetStr);
                let parentNode = getNode(targetPath.slice(0, -1));
                let targetName = targetPath[targetPath.length - 1];

                if (!parentNode || !parentNode.content[targetName]) {
                    if (!force) print(`rm: cannot remove '${targetStr}': No such file or directory`);
                    removeTarget(idx + 1);
                    return;
                }

                if (parentNode.content[targetName].type === 'dir' && !recursive) {
                    print(`rm: cannot remove '${targetStr}': Is a directory`);
                    removeTarget(idx + 1);
                    return;
                }

                if (interactive && !force) {
                    let typeStr = parentNode.content[targetName].type === 'dir' ? 'directory' : 'regular file';
                    print(`rm: remove ${typeStr} '${targetStr}'? (y/n)`);
                    
                    let originalKeydown = document.activeElement.onkeydown;
                    let currentInput = document.activeElement;
                    
                    let handleConfirm = function(e) {
                        if (e.key === 'Enter') {
                            let answer = currentInput.value.trim().toLowerCase();
                            
                            if (answer === 'y' || answer === 'yes') {
                                delete parentNode.content[targetName];
                                if (!force) print(`'${targetStr}' removed.`);
                            }
                            
                            removeTarget(idx + 1);
                        }
                    };
                    
                    return;
                } else {
                    delete parentNode.content[targetName];
                    if (!force) print(`'${targetStr}' removed.`);
                    removeTarget(idx + 1);
                }
            };

            removeTarget(0);
        },
                        
        

        cp(args) {
            if (!args[1] || !args[2]) {
                print("cp: missing file operand");
            } else {
                let srcPath = resolvePath(args[1]);
                let destPath = resolvePath(args[2]);
                let srcNode = getNode(srcPath);
                if (!srcNode) {
                    print(`cp: cannot stat '${args[1]}': No such file or directory`);
                    return;
                }
                let destParent = getNode(destPath.slice(0, -1));
                if (!destParent || destParent.type !== 'dir') {
                    print(`cp: cannot create file '${args[2]}': No such directory`);
                    return;
                }
                let destName = destPath[destPath.length - 1];
                destParent.content[destName] = JSON.parse(JSON.stringify(srcNode));
                setPermissions(destPath, '644', currentUser, currentUser);
                saveVFS();
                print(`'${args[1]}' -> '${args[2]}' copied successfully.`);
            }
        },

        mv(args) {
            if (!args[1] || !args[2]) {
                print("mv: missing file operand");
            } else {
                let srcPath = resolvePath(args[1]);
                let destPath = resolvePath(args[2]);
                let srcNode = getNode(srcPath);
                if (!srcNode) {
                    print(`mv: cannot stat '${args[1]}': No such file or directory`);
                    return;
                }
                let destParent = getNode(destPath.slice(0, -1));
                if (!destParent || destParent.type !== 'dir') {
                    print(`mv: cannot create file '${args[2]}': No such directory`);
                    return;
                }
                let srcParent = getNode(srcPath.slice(0, -1));
                let srcName = srcPath[srcPath.length - 1];
                let destName = destPath[destPath.length - 1];
                delete srcParent.content[srcName];
                destParent.content[destName] = srcNode;
                saveVFS();
                print(`'${args[1]}' -> '${args[2]}' moved successfully.`);
            }
        },

        echo(args) {
  
            let echoText = args.slice(1).join(" ");
            if (echoText.includes(">")) {
                let parts = echoText.split(/\s*>\s*/);
                if (parts.length === 2) {
                    let content = parts[0].trim();
                    let filename = parts[1].trim();
                    if (filename) {
                        let pathParts = resolvePath(filename);
                        let targetNode = getNode(pathParts.slice(0, -1));
                        let fname = pathParts[pathParts.length - 1];
                        if (targetNode && targetNode.type === 'dir') {
                            targetNode.content[fname] = { type: "file", content: content };
                            saveVFS();
                            print(`File '${filename}' written successfully.`);
                        } else {
                            print(`bash: echo: ${filename}: No such directory`);
                        }
                        return;
                    }
                }
            }
            print(echoText);
        },

        alias(args) {
            if (!args[1]) {
                print("Current aliases:");
                for (let key in aliases) {
                    print(`alias ${key}='${aliases[key]}'`);
                }
            } else {
                let parts = args.slice(1).join(" ").split("=");
                if (parts.length === 2) {
                    let name = parts[0].trim();
                    let value = parts[1].trim();
                    if (commands[name]) {
                        aliases[name] = value;
                        saveAliases();
                        print(`Alias '${name}' created: '${value}'`);
                    } else {
                        print(`alias: '${name}' is not a valid command`);
                    }
                } else {
                    print("alias: invalid format. Use: alias name='command'");
                }
            }
        },

        history() {
            for (let i = 0; i < commandHistory.length; i++) {
                print(`${i+1}  ${commandHistory[i]}`);
            }
        },

        useradd(args) {
            if (!args[1]) {
                print("useradd: missing username");
            } else {
                let username = args[1];
                if (users[username]) {
                    print(`useradd: user '${username}' already exists`);
                } else {
                    users[username] = { password: username, home: "/home/" + username };
                    saveUsers();
                    vfs.content.home.content[username] = { type: "dir", content: {} };
                    saveVFS();
                    print(`User '${username}' created successfully.`);
                }
            }
        },

        passwd(args) {
            if (!args[1]) {
                print("passwd: missing username");
            } else {
                let username = args[1];
                if (!users[username]) {
                    print(`passwd: user '${username}' does not exist`);
                } else {
                    users[username].password = "newpass";
                    saveUsers();
                    print(`Password for '${username}' changed successfully.`);
                }
            }
        },

        su(args) {
            if (!args[1]) {
                print("su: missing username");
            } else {
                let username = args[1];
                if (!users[username]) {
                    print(`su: user '${username}' does not exist`);
                } else {
                    currentUser = username;
                    let homePath = users[username].home;
                    if (homePath) {
                        currentPath = homePath.split('/').filter(p => p);
                        if (currentPath.length === 0) currentPath = [""];
                    }
                    print(`Switched to user '${username}'`);
                }
            }
        },

        chmod(args) {
            if (!args[1] || !args[2]) {
                print(`chmod: missing operand or mode`);
            } else {
                let targetPath = resolvePath(args[2]);
                let node = getNode(targetPath);
                if (!node) {
                    print(`chmod: cannot access '${args[2]}': No such file or directory`);
                } else {
                    let perms = getPermissions(targetPath);
                    perms.mode = args[1];
                    setPermissions(targetPath, perms.mode, perms.owner, perms.group);
                    print(`Permissions changed for '${args[2]}' to '${args[1]}'.`);
                }
            }
        },

        chown(args) {
            if (!args[1] || !args[2]) {
                print(`chown: missing operand`);
            } else {
                let targetPath = resolvePath(args[2]);
                let node = getNode(targetPath);
                if (!node) {
                    print(`chown: cannot access '${args[2]}': No such file or directory`);
                } else {
                    let perms = getPermissions(targetPath);
                    perms.owner = args[1];
                    setPermissions(targetPath, perms.mode, perms.owner, perms.group);
                    print(`Owner changed for '${args[2]}' to '${args[1]}'.`);
                }
            }
        },

        sudo(args) {
            let sudoText = args.slice(1).join(" ");
            if (!sudoText) {
                print("sudo: missing command");
                return;
            }
            if (currentUser === "root") {
                let sudoArgs = sudoText.split(/\s+/);
                let sudoCmd = sudoArgs[0];
                if (commands[sudoCmd]) {
                    commands[sudoCmd](sudoArgs);
                } else {
                    print(`bash: ${sudoCmd}: command not found`);
                }
            } else {
                print(`[sudo] password for ${currentUser}: (simulated)`);
                print(`[sudo] Executing '${sudoText}' with root privileges.`);
                let originalUser = currentUser;
                currentUser = "root";
                let sudoArgs = sudoText.split(/\s+/);
                let sudoCmd = sudoArgs[0];
                if (commands[sudoCmd]) {
                    commands[sudoCmd](sudoArgs);
                } else {
                    print(`bash: ${sudoCmd}: command not found`);
                }
                currentUser = originalUser;
            }
        },

        cowsay(args) {
            let text = args.slice(1).join(" ") || "Moo!";
            print(` __________`);
            print(`< ${text} >`);
            print(` ----------`);
            print(`        \\   ^__^`);
            print(`         \\  (oo)\\_______`);
            print(`            (__)\\       )\\/\\`);
            print(`                ||----w |`);
            print(`                ||     ||`);
        },

        fortune() {
            let fortunes = [
                "The best way to predict the future is to create it.",
                "In the middle of difficulty lies opportunity.",
                "The only way to do great work is to love what you do.",
                "Life is what happens when you're busy making other plans.",
                "Keep calm and carry on.",
                "The journey of a thousand miles begins with one step."
            ];
            let idx = Math.floor(Math.random() * fortunes.length);
            print(fortunes[idx]);
        },

        uname(args) {
            if (args[1] === '-r') {
                print("6.18-mehmetos");
            } else if (args[1] === '-n') {
                print(systemHostname);
            } else if (args[1] === '-a') {
                print(`Linux ${systemHostname} 6.18-mehmetos #1 SMP PREEMPT_DYNAMIC Sat Jun 19 12:34:56 UTC 2026 x86_64 GNU/Linux`);
            } else {
                print("Linux");
            }
        },

        neofetch() {
            let cores = navigator.hardwareConcurrency || "Unknown";
            let mem = navigator.deviceMemory ? navigator.deviceMemory + "GB" : "Unknown";
            let fetchArt = `
<div style="display: flex; gap: 20px;">
<div style="color: #8ae234;">
███╗   ███╗███████╗██╗  ██╗
████╗ ████║██╔════╝██║  ██║
██╔████╔██║█████╗  ███████║
██║╚██╔╝██║██╔══╝  ██╔══██║
██║ ╚═╝ ██║███████╗██║  ██║
╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝
</div>
<div>
<span class="user">${currentUser}@${systemHostname}</span>
-------------------
<span class="user">OS</span>: MehmetOS GNU/Linux
<span class="user">Kernel</span>: 6.18-mehmetos
<span class="user">Uptime</span>: ${getUptime()}
<span class="user">Shell</span>: bash
<span class="user">CPU</span>: ${cores} Cores
<span class="user">Memory</span>: ${mem}
<span class="user">User</span>: ${currentUser}
<span class="user">Hostname</span>: ${systemHostname}
</div>
</div>`;
            print(fetchArt, true);
        },

        clear() {
            terminal.innerHTML = "";
        },

                mainsite() {
            print("You are being redirected to the main site, goodbye!🚀");
            setTimeout(function() {
                window.location.href = "https://mehmet.is-a.dev";
            }, 1000); o
        },
        
        mainsite() {
            print("You are being redirected to the main site, goodbye. ! 🚀");
            setTimeout(function() {
                window.location.href = "https://mehmet.is-a.dev";
            }, 1000);
        },
        
                reboot() {
            location.reload();
        }
    }; // commands objesi burada temiz bir sekilde kapandi

    function runCommand(rawValue) {
        if (rawValue.trim() === "") {
            newInput();
            return;
        }

        let pipelineParts = rawValue.split('|');
        let currentInputData = "";

        for (let i = 0; i < pipelineParts.length; i++) {
            let cmdPart = pipelineParts[i].trim();
            if (cmdPart === "") continue;

            let outputBuffer = "";
            let originalPrint = print;
            print = function(text, isHtml = false) {
                outputBuffer += text + "\n";
            };

            let args = cmdPart.split(/\s+/);
            let cmdName = args[0];

            let isLastStep = (i === pipelineParts.length - 1);

            if (isLastStep && (cmdPart.includes('>') || cmdPart.includes('>>'))) {
                print = originalPrint;
                
                let isAppend = cmdPart.includes('>>');
                let redirectSplit = isAppend ? cmdPart.split('>>') : cmdPart.split('>');
                
                let actualCmdPart = redirectSplit[0].trim();
                let filename = redirectSplit[1].trim();
                
                let actualArgs = actualCmdPart.split(/\s+/);
                let actualCmdName = actualArgs[0];
                
                let fileOutputBuffer = "";
                print = function(text) {
                    fileOutputBuffer += text + "\n";
                };

                let cmdFunc = commands[actualCmdName];
                if (cmdFunc) {
                    cmdFunc(actualArgs, currentInputData);
                } else {
                    originalPrint(`bash: ${actualCmdName}: command not found`);
                    print = originalPrint;
                    newInput();
                    return;
                }

                print = originalPrint;
                
                let targetPath = resolvePath(filename);
                let parentNode = getNode(targetPath.slice(0, -1));
                let targetName = targetPath[targetPath.length - 1];

                if (parentNode && parentNode.type === 'dir') {
                    if (isAppend && parentNode.content[targetName] && parentNode.content[targetName].type === 'file') {
                        parentNode.content[targetName].content += fileOutputBuffer;
                    } else {
                        parentNode.content[targetName] = { type: "file", content: fileOutputBuffer };
                    }
                    saveVFS();
                } else {
                    print(`bash: ${filename}: No such file or directory`);
                }
                
                currentInputData = "";
                continue;
            }

            let cmdFunc = commands[cmdName];
            if (cmdFunc) {
                cmdFunc(args, currentInputData);
            } else {
                originalPrint(`bash: ${cmdName}: command not found`);
                print = originalPrint;
                newInput();
                return;
            }

            print = originalPrint;
            currentInputData = outputBuffer;
        }

        if (currentInputData.trim() !== "") {
            print(currentInputData.trim());
        }

        newInput();
    }

    init();
