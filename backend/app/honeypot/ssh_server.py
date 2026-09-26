import asyncio
import uuid

from backend.app.honeypot.session import HoneypotSession
from backend.app.honeypot.telemetry_client import TelemetryClient


class MirageSSHServer:

    def __init__(
        self,
        host: str = "127.0.0.1",
        port: int = 2222,
    ):
        self.host = host
        self.port = port

        self.sessions: dict[
            str,
            HoneypotSession
        ] = {}

        self.telemetry = TelemetryClient()

    async def send_telemetry(
        self,
        session: HoneypotSession,
        event_type: str,
        command: str | None = None,
    ):

        await self.telemetry.send_event(
            session_id=session.session_id,
            source_ip=session.source_ip,
            event_type=event_type,
            command=command,
            username=session.username,
            service=session.service,
        )

    async def handle_client(
        self,
        reader: asyncio.StreamReader,
        writer: asyncio.StreamWriter,
    ):

        peer = writer.get_extra_info(
            "peername"
        )

        source_ip = (
            peer[0]
            if peer
            else "unknown"
        )

        temporary_session_id = str(
            uuid.uuid4()
        )

        session = HoneypotSession(
            session_id=temporary_session_id,
            source_ip=source_ip,
        )

        try:

            api_session_id = (
                await self.telemetry.create_session(
                    source_ip=source_ip,
                    service="ssh",
                )
            )

            if api_session_id:

                session.session_id = (
                    api_session_id
                )

        except Exception as exc:

            print(
                "[Mirage SSH] "
                f"Telemetry session error: {exc}"
            )

        self.sessions[
            session.session_id
        ] = session

        print()
        print(
            "[Mirage SSH] "
            f"New session: "
            f"{session.session_id}"
        )

        print(
            "[Mirage SSH] "
            f"Source IP: {source_ip}"
        )

        try:

            writer.write(
                b"Mirage SSH Honeypot\r\n"
            )

            writer.write(
                b"login: "
            )

            await writer.drain()

            username_data = (
                await reader.readline()
            )

            username = (
                username_data.decode(
                    errors="ignore"
                ).strip()
            )

            session.username = username

            await self.send_telemetry(
                session,
                "login_attempt",
            )

            writer.write(
                b"Password: "
            )

            await writer.drain()

            await reader.readline()

            session.authenticated = True

            writer.write(
                b"\r\nWelcome to Mirage.\r\n"
            )

            writer.write(
                b"mirage@honeypot:~$ "
            )

            await writer.drain()

            while True:

                data = (
                    await reader.readline()
                )

                if not data:
                    break

                command = (
                    data.decode(
                        errors="ignore"
                    ).strip()
                )

                if not command:

                    writer.write(
                        b"mirage@honeypot:~$ "
                    )

                    await writer.drain()

                    continue

                session.record_command(
                    command
                )

                await self.send_telemetry(
                    session,
                    "command_execution",
                    command,
                )

                response = (
                    self.execute_fake_command(
                        command
                    )
                )

                writer.write(
                    response.encode()
                )

                if command.lower() in {
                    "exit",
                    "logout",
                }:

                    await writer.drain()

                    break

                writer.write(
                    b"mirage@honeypot:~$ "
                )

                await writer.drain()

        except Exception as exc:

            print(
                "[Mirage SSH] "
                f"Session error: {exc}"
            )

        finally:

            print(
                "[Mirage SSH] "
                f"Session {session.session_id} "
                f"closed | "
                f"Commands: "
                f"{session.command_count}"
            )

            writer.close()

            try:

                await writer.wait_closed()

            except Exception:

                pass

    def execute_fake_command(
        self,
        command: str,
    ) -> str:

        command_lower = (
            command.lower()
        )

        if command_lower == "whoami":

            return "root\r\n"

        if command_lower == "hostname":

            return "mirage-server\r\n"

        if command_lower == "id":

            return (
                "uid=0(root) "
                "gid=0(root) "
                "groups=0(root)\r\n"
            )

        if command_lower == "pwd":

            return "/root\r\n"

        if command_lower in {
            "ls",
            "ls -la",
            "ls -l",
        }:

            return (
                "total 24\r\n"
                "drwx------  3 root root 4096 Sep 24 09:00 .\r\n"
                "drwxr-xr-x 18 root root 4096 Sep 24 08:00 ..\r\n"
                "-rw-r--r--  1 root root  220 Sep 24 08:00 .bashrc\r\n"
                "-rw-r--r--  1 root root 3526 Sep 24 08:00 .bash_profile\r\n"
                "drwxr-xr-x  2 root root 4096 Sep 24 08:30 scripts\r\n"
            )

        if command_lower == "uname -a":

            return (
                "Linux mirage-server "
                "6.8.0-mirage #1 SMP "
                "x86_64 GNU/Linux\r\n"
            )

        if command_lower == "ifconfig":

            return (
                "eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>\r\n"
                "    inet 10.10.10.15  netmask 255.255.255.0\r\n"
                "    ether 02:42:ac:11:00:15\r\n"
            )

        if command_lower == "ip addr":

            return (
                "1: lo: <LOOPBACK,UP,LOWER_UP>\r\n"
                "    inet 127.0.0.1/8\r\n"
                "2: eth0: <BROADCAST,UP,LOWER_UP>\r\n"
                "    inet 10.10.10.15/24\r\n"
            )

        if command_lower == "cat /etc/passwd":

            return (
                "root:x:0:0:root:/root:/bin/bash\r\n"
                "mirage:x:1000:1000:Mirage User:/home/mirage:/bin/bash\r\n"
                "backup:x:1001:1001:Backup User:/home/backup:/bin/bash\r\n"
            )

        if command_lower == "sudo -l":

            return (
                "Matching Defaults entries for root:\r\n"
                "    env_reset\r\n"
                "\r\n"
                "User root may run the following commands:\r\n"
                "    (ALL : ALL) ALL\r\n"
            )

        if command_lower == "clear":

            return "\033[2J\033[H"

        if command_lower in {
            "exit",
            "logout",
        }:

            return "logout\r\n"

        return (
            f"-bash: {command}: "
            "command not found\r\n"
        )


async def start_ssh_honeypot(
    host: str = "127.0.0.1",
    port: int = 2222,
):

    server_instance = MirageSSHServer(
        host=host,
        port=port,
    )

    server = await asyncio.start_server(
        server_instance.handle_client,
        host,
        port,
    )

    addresses = ", ".join(
        str(sock.getsockname())
        for sock in server.sockets
    )

    print(
        "[Mirage SSH] "
        f"Honeypot listening on {addresses}"
    )

    async with server:

        await server.serve_forever()


if __name__ == "__main__":

    try:

        asyncio.run(
            start_ssh_honeypot()
        )

    except KeyboardInterrupt:

        print(
            "\n[Mirage SSH] "
            "Honeypot stopped."
        )