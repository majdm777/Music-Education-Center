# IBM Plex Sans Arabic

Vendored so the web build never fetches fonts from a third party. `next build`
reads these files directly; a fresh clone builds without network access to
Google Fonts.

- Package: `@ibm/plex-sans-arabic@1.1.0`
- Tarball: <https://registry.npmjs.org/@ibm/plex-sans-arabic/-/plex-sans-arabic-1.1.0.tgz>
- Integrity: `sha512-u8wIS6szLAOFvlBjCFZmtpKIqbhuIuniG2N0J+sio8vV6INH58hP0t0QNYrSl9SZtCv2Fwb4oQGuZJY3kJ4+QA==`
- Files: the unmodified `fonts/complete/woff2/IBMPlexSansArabic-*.woff2` files
  for weights 400, 500, 600 and 700
- License: SIL Open Font License 1.1, see [OFL.txt](OFL.txt)

To update, download the pinned tarball, copy the four `woff2` files and
`LICENSE.txt` (as `OFL.txt`), and verify the weights still match
`apps/web/src/app/layout.tsx`.
