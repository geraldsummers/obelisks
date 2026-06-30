#!/usr/bin/env python3
"""Exec a command after disabling transparent huge pages for this process tree."""

import ctypes
import os
import sys


PR_SET_THP_DISABLE = 41


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: disable_thp_exec.py <command> [args...]", file=sys.stderr)
        return 2

    libc = ctypes.CDLL(None, use_errno=True)
    result = libc.prctl(PR_SET_THP_DISABLE, 1, 0, 0, 0)
    if result != 0:
        errno = ctypes.get_errno()
        raise OSError(errno, os.strerror(errno))

    os.execvp(sys.argv[1], sys.argv[1:])
    return 127


if __name__ == "__main__":
    raise SystemExit(main())
