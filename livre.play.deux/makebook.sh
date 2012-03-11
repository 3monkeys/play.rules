pandoc -s --toc --epub-metadata=meta.xml --highlight-style kate  -o play.rules.return.epub 00-00-cover.md \
00-01-Preface.md \
part00-ch00-cover.md \
part00-ch01-initiation.md

pandoc -s --toc --highlight-style kate -c style.css -o play.rules.return.docx 00-00-cover.md \
00-01-Preface.md \
part00-ch00-cover.md \
part00-ch01-initiation.md

pandoc -s --toc --highlight-style kate -c style.css -o play.rules.return.html 00-00-cover.md \
00-01-Preface.md \
part00-ch00-cover.md \
part00-ch01-initiation.md


--include-in-header=style.css
