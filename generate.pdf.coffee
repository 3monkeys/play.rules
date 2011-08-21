PDFDocument = require 'pdfkit'
findit = require('findit')
path = require('path')
fs = require('fs')
doc = new PDFDocument

files = []

output = []

config = 
  font: 'fonts/sanfw.ttf'

process = ->
  files.forEach (file) ->
    content = fs.readFileSync(file, 'utf8').toString()
    output.push(content)
    
  generatePdf output
  
generatePdf = (output) ->
  
  ## Fit the image within the dimensions
  doc.image('rsrc/Play_rules.png', fit: [600, 600])
  
  
  doc.font(config.font)
    .fontSize(12)
  
  output.forEach (file) ->
    doc.addPage()
    
    codes = []
    
    file.split('\n').forEach (line) ->
      heading = line.match(/^#+/g)
      text = do line.trim
      h = doc.currentLineHeight()
      
      return unless line
      
      ## deal with head
      if heading
        doc.fontSize 12 + 15 * 1 / heading[0].length
        return doc.text "#{text}\n".replace(/^#+\s?/, '')
      
      doc.fontSize 12
      
      # ## deal with code blocks
      if line.match /\s{4}/
        return codes.push(line)
      else 
        if codes.length
          doc.font 'Courier'
          doc.fontSize 10
          codes.forEach (code) ->
            indent = code.match(/^(\s+)/)?[0].length
            ctext = if /^\/\//.test(code.trim()) or /\.\.\./.test(code) then '' else code
            doc.text ctext, {indent: 5 * indent, fill: true, lineGap: 2} if ctext.trim()
            
          codes = []
          text = "\n#{text}"
            
        doc.font config.font
        doc.fontSize 12
        
        ## links?
        links = []
        text = text.replace /\[([^\]]+)\]\(([^)]+)\)/g, (w, label, href) ->
          links.push {
            label: label
            href: href
            count: links.length + 1
          }
          
          return "#{label}(#{links.length})"
        
        doc.fillColor('#444')
        doc.text "#{text}\n", { lineGap: 5 }
      
        links.forEach (link) ->
          doc.fontSize(10)
            .fillColor('#789220')
            .text("#{link.count}: #{link.href}\n\n\n")
  
  console.log 'Pdf output >> ', __dirname + '/output.pdf'
  doc.write 'output.pdf'

## Start stuff
findit(path.join(__dirname, 'livre'))
  .on('file', (file, stat) -> files.push(file) if /\.md$/.test(file) and stat.isFile())
  .on('end', process)