
import os
from .base import *

DEBUG = True

raw_hosts = os.getenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,backend,gateway")
ALLOWED_HOSTS = [h.strip() for h in raw_hosts.split(",") if h.strip()]

