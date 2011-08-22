PDFDocument = require 'pdfkit'
findit = require('findit')
path = require('path')
fs = require('fs')
doc = new PDFDocument

files = []

output = []

config = 
  path: path.join __dirname, 'livre'
  ext: 'md'
  fonts: 
    main: 'fonts/sanfw.ttf'
    heading: 'fonts/sanfw.ttf'
    code: 'Courier'
  size: 
    main: 12
    heading: 15
    code: 10
    links: 10
  colors: 
    main: '#444'
    heading: '#789220'
    code: '#954121'
    links: '#19469D'

process = ->
  files.forEach (file) ->
    content = fs.readFileSync(file, 'utf8').toString()
    output.push({file, content})
    
  generatePdf output
  
class Parser
  constructor: (@doc) ->
    @codeBlock = []
  heading: (line, text) ->
    @doc.font config.fonts.heading
    @doc.fillColor config.colors.heading
    @doc.fontSize config.size.main + config.size.heading * 1 / text.length
    @doc.text "#{line}\n".replace(/^#+\s?/, '')
  code: ->        
    @doc.font config.fonts.code
    @doc.fontSize config.size.code
    @doc.fillColor config.colors.code
    @codeBlock.forEach (code) =>
      indent = code.match(/^(\s+)/)?[0].length
      ctext = if /^\/\//.test(code.trim()) or /\.\.\./.test(code) then '' else code
      doc.text ctext, {indent: 5 * indent, fill: true, lineGap: 2} if ctext.trim()
      @codeBlock = []
      
  paragraph: (text) ->
    @doc.fontSize config.size.main
    @doc.font config.fonts.main
    @doc.fillColor config.colors.main
    ## links?
    links = []
    text = text.replace /\[([^\]]+)\]\(([^)]+)\)/g, (w, label, href) ->
      links.push {
        label: label
        href: href
        count: links.length + 1
      }
      return "#{label}(#{links.length})"
    doc.text "#{text}\n", { lineGap: 5 }
    links.forEach (link) ->
      doc.fontSize(config.size.links)
        .fillColor(config.colors.links)
        .text("#{link.count}: #{link.href}\n\n\n")
  img: (img) ->
    p = img[1].split('/rsrc/')[1]?.replace('?raw=true', '')
    return unless p
    do doc.addPage if doc.y > 450
    doc.image path.join(__dirname, '/rsrc/', p), fit: [350, 350]
    
  
generatePdf = (output) ->
  
  parser = new Parser doc
  
  ## Fit the image within the dimensions
  doc.image('rsrc/Play_rules.png', fit: [600, 600])
  
  doc.text 'test', 100, 750 - 300
  
  
  doc.font(config.fonts.main)
    .fontSize(12)
  
  console.log "About to generate pdf for #{files.length} files..."
  output.forEach (file) ->
    console.log "#{file.file}..."
    doc.addPage()
    
    codes = []
    
    file.content.split('\n').forEach (line) ->
      heading = line.match(/^#+/g)
      img = line.match(/!\[[^\]]+]\(([^\)]+)\)/)
      code = line.match /\s{4}/
      htmlComment = line.match(/<!--[^>]+>/)
      text = do line.trim
      h = doc.currentLineHeight()
      
      return unless line
      
      if htmlComment
        return
      
      ## deal with head
      if heading
        return parser.heading(line, heading[0])
      
      # ## deal with code blocks
      if code
        return parser.codeBlock.push(line)
        
      if parser.codeBlock.length
        return parser.code()
      
      if img
        return parser.img(img)
        
      # ![Alt "p00_ch02_01"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch02_01.png)
        
      parser.paragraph text
      
  console.log 'Pdf output >> ', __dirname + '/output.pdf'
  doc.write 'output.pdf'

## Start stuff
findit(config.path)
  .on('file', (file, stat) -> files.push(file) if file.match(/\.md$/) and stat.isFile())
  .on('end', process)