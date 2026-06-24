import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "index.html"


class GraduationInvitationChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = HTML_PATH.read_text(encoding="utf-8-sig")

    def test_submit_controls_are_declared_before_validation_returns(self):
        function = re.search(
            r"async function submitRSVP\(e\) \{(?P<body>.*?)\n    \}",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(function)
        body = function.group("body")
        declaration = body.index("const btn = document.getElementById('btn-submit')")
        guest_validation = body.index("// Validate guest count")
        message_validation = body.index("// Validate message length")
        self.assertLess(declaration, guest_validation)
        self.assertLess(declaration, message_validation)

    def test_long_invite_starts_at_top_and_cannot_overflow_horizontally(self):
        invite_rule = re.search(r"#screen-invite\s*\{(?P<body>.*?)\}", self.html, re.DOTALL)
        wrapper_rule = re.search(r"\.invite-wrapper\s*\{(?P<body>.*?)\}", self.html, re.DOTALL)
        self.assertIsNotNone(invite_rule)
        self.assertIsNotNone(wrapper_rule)
        self.assertIn("justify-content: flex-start", invite_rule.group("body"))
        self.assertIn("overflow-x: hidden", invite_rule.group("body"))
        self.assertIn("max-width: 100%", wrapper_rule.group("body"))
        self.assertIn("flex-shrink: 0", wrapper_rule.group("body"))

    def test_screen_switching_manages_inert_state_and_focus(self):
        self.assertRegex(
            self.html,
            r'id="screen-invite"[^>]*aria-hidden="true"[^>]*inert',
        )
        self.assertRegex(
            self.html,
            r'id="screen-thanks"[^>]*aria-hidden="true"[^>]*inert',
        )
        self.assertIn("s.inert = true", self.html)
        self.assertIn("target.inert = false", self.html)
        self.assertIn("data-screen-focus", self.html)
        self.assertRegex(
            self.html,
            r"setTimeout\(\(\) => \{\s*target\.querySelector\('\[data-screen-focus\]'\)"
            r"\?\.focus\(\{ preventScroll: true \}\);",
        )

    def test_honeypot_is_hidden_from_assistive_technology(self):
        self.assertRegex(
            self.html,
            r'name="_gotcha"[^>]*hidden[^>]*aria-hidden="true"',
        )

    def test_guest_query_parameter_is_not_decoded_twice(self):
        self.assertNotIn("decodeURIComponent(guest)", self.html)

    def test_social_preview_asset_exists(self):
        match = re.search(r'<meta property="og:image" content="[^"]*/([^/"]+)">', self.html)
        self.assertIsNotNone(match)
        self.assertTrue((ROOT / match.group(1)).is_file())

    def test_repository_has_basic_public_documentation(self):
        self.assertTrue((ROOT / "README.md").is_file())
        self.assertTrue((ROOT / ".gitignore").is_file())

    def test_interactions_are_bound_without_inline_event_attributes(self):
        self.assertNotRegex(self.html, r"\sonclick=")
        self.assertNotRegex(self.html, r"\sonsubmit=")
        self.assertRegex(
            self.html,
            r"querySelector\('\.envelope-btn'\).*?addEventListener\('click', openEnvelope\)",
        )
        self.assertRegex(
            self.html,
            r"getElementById\('rsvp-form'\).*?addEventListener\('submit', submitRSVP\)",
        )

    def test_repeat_rsvp_guard_is_configured_for_sixty_seconds(self):
        self.assertIn("const RSVP_REPEAT_WINDOW_MS = 60000", self.html)
        self.assertIn("Bạn vừa gửi xác nhận", self.html)

    def test_low_contrast_helper_text_and_status_are_accessible(self):
        optional_rule = re.search(r"\.form-group \.optional\s*\{(?P<body>.*?)\}", self.html, re.DOTALL)
        placeholder_rule = re.search(
            r"\.form-group input::placeholder,\s*\.form-group textarea::placeholder\s*\{(?P<body>.*?)\}",
            self.html,
            re.DOTALL,
        )
        banner_rule = re.search(r"\.sent-banner\s*\{(?P<body>.*?)\}", self.html, re.DOTALL)
        self.assertIsNotNone(optional_rule)
        self.assertIsNotNone(placeholder_rule)
        self.assertIsNotNone(banner_rule)
        self.assertIn("rgba(255, 255, 255, .55)", optional_rule.group("body"))
        self.assertIn("rgba(255, 255, 255, .5)", placeholder_rule.group("body"))
        self.assertIn("rgba(255, 255, 255, .7)", banner_rule.group("body"))
        self.assertRegex(
            self.html,
            r'id="sent-banner"[^>]*role="status"[^>]*aria-live="polite"',
        )

    def test_handoff_documentation_exists(self):
        self.assertTrue((ROOT / "AGENTS.md").is_file())
        self.assertTrue((ROOT / "docs" / "ARCHITECTURE.md").is_file())
        self.assertTrue((ROOT / "docs" / "PROJECT_STATUS.md").is_file())

    def test_obsolete_patch_scripts_and_crash_dump_are_removed(self):
        obsolete_paths = [
            "apply_fixes.py",
            "apply_fixes2.py",
            "apply_fixes3.py",
            "fix_all.py",
            "fix_remaining.py",
            "bash.exe.stackdump",
        ]
        for relative_path in obsolete_paths:
            with self.subTest(path=relative_path):
                self.assertFalse((ROOT / relative_path).exists())


if __name__ == "__main__":
    unittest.main()
