pandoc -s --toc --epub-metadata=meta.xml --highlight-style kate  -o play2.rules.return.epub 00-00-cover.md \
00-01-Preface.md \
00-play.md \
01-installation.md \
02-firstapp.md \
03-ide.md \
04-firstapp.next.md \
05-sexy.md \
06-initialdata.md \
07-authentication.md \
08-services.md

pandoc -s --toc --highlight-style kate -c style.css -o play2.rules.return.docx 00-00-cover.md \
00-01-Preface.md \
00-play.md \
01-installation.md \
02-firstapp.md \
03-ide.md \
04-firstapp.next.md \
05-sexy.md \
06-initialdata.md \
07-authentication.md \
08-services.md

pandoc -s --toc --highlight-style kate -c style.css -o play2.rules.return.html 00-00-cover.md \
00-01-Preface.md \
00-play.md \
01-installation.md \
02-firstapp.md \
03-ide.md \
04-firstapp.next.md \
05-sexy.md \
06-initialdata.md \
07-authentication.md \
08-services.md

