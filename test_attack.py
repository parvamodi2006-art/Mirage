import socket

HOST = "127.0.0.1"
PORT = 2222


def receive_until(sock, marker):
    data = b""

    while marker not in data:
        chunk = sock.recv(4096)

        if not chunk:
            break

        data += chunk

    return data.decode(errors="ignore")


commands = [
    "whoami",
    "ifconfig",
    "ls -la",
    "cat /etc/passwd",
    "sudo -l",
    "bash",
]


with socket.create_connection((HOST, PORT)) as sock:

    print(receive_until(sock, b"login:"))

    sock.sendall(b"testuser\n")

    print(receive_until(sock, b"Password:"))

    sock.sendall(b"testpass\n")

    print(
        receive_until(
            sock,
            b"mirage@honeypot:~$ "
        )
    )

    for command in commands:

        print(f"\n>>> {command}")

        sock.sendall(
            (command + "\n").encode()
        )

        output = receive_until(
            sock,
            b"mirage@honeypot:~$ "
        )

        print(output)


print("\n[TEST] Attack simulation completed.")