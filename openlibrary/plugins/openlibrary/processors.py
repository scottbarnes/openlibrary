"""web.py application processors for Open Library.
"""
import web

from openlibrary.core.processors import ReadableUrlProcessor

from openlibrary.core import helpers as h
from infogami.utils.delegate import RawText
from typing import Callable, Optional, Set, Union
from web.template import TemplateResult
from web.webapi import OK

urlsafe = h.urlsafe
_safepath = h.urlsafe


class ProfileProcessor:
    """Processor to profile the webpage when ?_profile=true is added to the url."""

    def __call__(self, handler: Callable) -> Union[RawText, TemplateResult, OK]:
        i = web.input(_method="GET", _profile="")
        if i._profile.lower() == "true":
            out, result = web.profile(handler)()
            if isinstance(out, web.template.TemplateResult):
                out.__body__ = (
                    out.get('__body__', '')
                    + '<pre class="profile">'
                    + web.websafe(result)
                    + '</pre>'
                )
                return out
            elif isinstance(out, str):
                return (
                    out
                    + '<br/>'
                    + '<pre class="profile">'
                    + web.websafe(result)
                    + '</pre>'
                )
            else:
                # don't know how to handle this.
                return out
        else:
            return handler()


class CORSProcessor:
    """Processor to handle OPTIONS method to support
    Cross Origin Resource Sharing.
    """

    def __init__(self, cors_prefixes: Optional[set[str]] = None) -> None:
        self.cors_prefixes = cors_prefixes

    def __call__(self, handler: Callable) -> Union[RawText, TemplateResult, OK]:
        if self.is_cors_path():
            self.add_cors_headers()
        if web.ctx.method == "OPTIONS":
            raise web.ok("")
        else:
            return handler()

    def is_cors_path(self) -> bool:
        if self.cors_prefixes is None or web.ctx.path.endswith(".json"):
            return True
        return any(
            web.ctx.path.startswith(path_segment) for path_segment in self.cors_prefixes
        )

    def add_cors_headers(self) -> None:
        # Allow anyone to access GET and OPTIONS requests
        allowed = "GET, OPTIONS"
        # unless the path is /account/* or /admin/*
        for p in ["/account", "/admin"]:
            if web.ctx.path.startswith(p):
                allowed = "OPTIONS"

        if (
            web.ctx.path == "/account/login.json"
            and web.input(auth_provider="").auth_provider == "archive"
        ):
            allowed += ", POST"
            web.header('Access-Control-Allow-Credentials', 'true')
            web.header("Access-Control-Allow-Origin", "https://archive.org")
        else:
            web.header("Access-Control-Allow-Origin", "*")

        web.header("Access-Control-Allow-Method", allowed)
        web.header("Access-Control-Max-Age", 3600 * 24)  # one day


if __name__ == "__main__":
    import doctest

    doctest.testmod()
