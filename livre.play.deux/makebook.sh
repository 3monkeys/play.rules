#pandoc -s --toc --highlight-style pygments -c --strict --template=tpl.tex -N -o play2.rules.return.pdf 00-00-cover.md \
#pandoc -s --toc --highlight-style pygments -c --strict -N --chapters -o play2.rules.return.pdf 00-00-cover.md \

pandoc -s --toc --highlight-style pygments -c --strict -N -o play2.rules.return.pdf 00-00-cover.md \
00-01-Preface.md \
00-play.md \
01-installation.md \
02-firstapp.md \
03-ide.md \
04-firstapp.next.md \
05-sexy.md \
06-initialdata.md \
07-validation.md \
08-authentication.md \
09-services.md \
10-assets.md

pandoc -s --toc --epub-metadata=meta.xml --epub-stylesheet=style.css --highlight-style pygments -N -o play2.rules.return.epub 00-00-cover.md \
00-01-Preface.md \
00-play.md \
01-installation.md \
02-firstapp.md \
03-ide.md \
04-firstapp.next.md \
05-sexy.md \
06-initialdata.md \
07-validation.md \
08-authentication.md \
09-services.md \
10-assets.md

#pandoc -s --toc --highlight-style kate -c style.css -o play2.rules.return.docx 00-00-cover.md \
#00-01-Preface.md \
#00-play.md \
#01-installation.md \
#02-firstapp.md \
#03-ide.md \
#04-firstapp.next.md \
#05-sexy.md \
#06-initialdata.md \
#07-validation.md \
#08-authentication.md \
#09-services.md \
#10-assets.md

pandoc -s --toc --highlight-style pygments -c style.css -N -o play2.rules.return.html 00-00-cover.md \
00-01-Preface.md \
00-play.md \
01-installation.md \
02-firstapp.md \
03-ide.md \
04-firstapp.next.md \
05-sexy.md \
06-initialdata.md \
07-validation.md \
08-authentication.md \
09-services.md \
10-assets.md
