import base64
import random
import time
from datetime import datetime, timedelta
from urllib import parse, request


ROUTER_IP = "192.168.0.1"
USER = "admin"
PASS = "admin"

MAC_PREFIX = ["8E", "6F", "A4", "17"]


def seconds_until_next_run() -> int:
    now = datetime.now()
    target_minute = (now.minute // 10) * 10 + 5
    target = now.replace(minute=0, second=0, microsecond=0) + timedelta(minutes=target_minute)

    if target <= now:
        target += timedelta(minutes=10)

    return max(1, int((target - now).total_seconds()))


def random_mac() -> list[str]:
    return MAC_PREFIX + [f"{random.randrange(256):02X}", f"{random.randrange(256):02X}"]


def post_form(path: str, data: dict[str, str], referer: str, content_type: bool = True) -> None:
    url = f"http://{ROUTER_IP}{path}"
    body = parse.urlencode(data).encode("utf-8")
    token = base64.b64encode(f"{USER}:{PASS}".encode("utf-8")).decode("ascii")

    headers = {
        "Authorization": f"Basic {token}",
        "Referer": referer,
    }
    if content_type:
        headers["Content-Type"] = "application/x-www-form-urlencoded"

    req = request.Request(url, data=body, headers=headers, method="POST")

    with request.urlopen(req, timeout=15) as response:
        response.read()


def change_mac(mac: list[str]) -> None:
    post_form(
        "/cgi-bin/timepro.cgi",
        {
            "tmenu": "iframe",
            "smenu": "hiddenwansetup",
            "act": "save",
            "ocolor": "",
            "wan": "wan1",
            "ifname": "eth3",
            "nopassword": "1",
            "wan_type": "dynamic",
            "hw_dynamic1": mac[0],
            "hw_dynamic2": mac[1],
            "hw_dynamic3": mac[2],
            "hw_dynamic4": mac[3],
            "hw_dynamic5": mac[4],
            "hw_dynamic6": mac[5],
            "hw_conf_dynamic": "on",
        },
        f"http://{ROUTER_IP}/cgi-bin/timepro.cgi?tmenu=iframe&smenu=hiddenwansetup",
    )


def wan_disconnect() -> None:
    post_form(
        "/cgi-bin/timepro.cgi",
        {"act": "wan_disconnect", "wan": "wan1"},
        f"http://{ROUTER_IP}/",
        content_type=False,
    )


def wan_connect() -> None:
    post_form(
        "/cgi-bin/timepro.cgi",
        {"act": "wan_connect", "wan": "wan1"},
        f"http://{ROUTER_IP}/",
        content_type=False,
    )


def main() -> None:
    while True:
        wait_sec = seconds_until_next_run()
        print(f"다음 실행까지 {wait_sec}초 대기...")
        time.sleep(wait_sec)

        print("===============================")
        print(f"실행 시간: {datetime.now():%Y-%m-%d %H:%M:%S}")
        print("===============================")

        mac = random_mac()
        print(f"MAC: {':'.join(mac)}")

        try:
            change_mac(mac)
            wan_disconnect()
            time.sleep(5)
            wan_connect()
            print("완료.")
        except Exception as exc:
            print(f"오류: {exc}")


if __name__ == "__main__":
    main()
