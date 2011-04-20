/**
* pdf-ui.js - A basic dom walker to generate pdf files using pdf.js 
*/
(function($, global) {
  
  // Make sure Object.create is available in the browser (for our prototypal inheritance)
  (function() {
    function F(){}
    if(typeof Object.create !== 'function') {
      Object.create = function(o) {
        F.prototype = o;
        return new F(); 
      };
    }
  })();
  
  /**
   * Bridge Utility method. Adds a new function to the jQuery namespace (a new plugin), 
   * create a new object (object litteral or module pattern) 
   * 
   * @method plugin
   * @namespace $
   */
  $.bridge = function(name, object) {
    var isFunction = $.isFunction(object);
    $.fn[name] = function(options) {
      
      if(!this.length) {
        // Don't act on absent element - learned from 10 things I learned (Paul Irish)
        return this;
      }
      
      return this.each(function() {
        // Create our object (instance)
        var obj = Object.create(isFunction ? object() : object);
        
        // Init constructor function, this stands for the DOM element to apply logic to
        obj.init(options, this);
        
        // Then, store our newly created instance in the DOM element data-store
        $.data(this, name, obj);
      });
    };
  };
  
  /** pdf - pdf.js **/
  /*

  pdf.js - Marak Squires 2010
  MIT yo, copy paste the credit
  based almost entirely on jsPDF (c) 2009 James Hall
  some parts based on FPDF.
   
  */

  /* dual-side hack, i sorry */
  var sprintf;
  var Base64;
  if(typeof exports == 'undefined'){
    var exports = window;
    var Base64 = window;
  }


  var pdf = exports.pdf = function(){
    
    // Private properties
    var version = '20090504';
    var buffer = '';
    
    var pdfVersion = '1.3'; // PDF Version
    var defaultPageFormat = 'a4';
    var pageFormats = { // Size in mm of various paper formats
      'a3': [841.89, 1190.55],
      'a4': [595.28, 841.89],
      'a5': [420.94, 595.28],
      'letter': [612, 792],
      'legal': [612, 1008]
    };
    var textColor = '0 g';
    var page = 0;
    var objectNumber = 2; // 'n' Current object number
    var state = 0; // Current document state
    var pages = new Array();
    var offsets = new Array(); // List of offsets
    var lineWidth = 0.200025; // 2mm
    var pageHeight;
    var k; // Scale factor
    var unit = 'mm'; // Default to mm for units
    var documentProperties = {};
    var fontSize = 16; // Default font size
    var pageFontSize = 16;
    var font = 'Helvetica'; // Default font
    var pageFont = font;
    var fonts = {}; // fonts holder, namely use in putRessource
    var fontIndex = 0; // F1, F2, etc. using setFont
    var fontsNumber = {}; // object number holder for fonts

    // Initilisation 
    if (unit == 'pt') {
      k = 1;
    } else if(unit == 'mm') {
      k = 72/25.4;
    } else if(unit == 'cm') {
      k = 72/2.54;
    } else if(unit == 'in') {
      k = 72;
    }
    
    // Private functions
    var newObject = function() {
      //Begin a new object
      objectNumber ++;
      offsets[objectNumber] = buffer.length;
      out(objectNumber + ' 0 obj');   
    }
    
    
    var putHeader = function() {
      out('%PDF-' + pdfVersion);
    }
    
    var putPages = function() {
      
      // TODO: Fix, hardcoded to a4 portrait
      var wPt = pageWidth * k;
      var hPt = pageHeight * k;

      for(n=1; n <= page; n++) {
        newObject();
        out('<</Type /Page');
        out('/Parent 1 0 R'); 
        out('/Resources 2 0 R');
        out('/Contents ' + (objectNumber + 1) + ' 0 R>>');
        out('endobj');
        
        //Page content
        p = pages[n];
        newObject();
        out('<</Length ' + p.length  + '>>');
        putStream(p);
        out('endobj');          
      }
      offsets[1] = buffer.length;
      out('1 0 obj');
      out('<</Type /Pages');
      var kids='/Kids [';
      for (i = 0; i < page; i++) {
        kids += (3 + 2 * i) + ' 0 R ';
      }
      out(kids + ']');
      out('/Count ' + page);
      out(sprintf('/MediaBox [0 0 %.2f %.2f]', wPt, hPt));
      out('>>');
      out('endobj');    
    }
    
    var putStream = function(str) {
      out('stream');
      out(str);
      out('endstream');
    }
    
    var putResources = function() {
      var f;
      // Deal with fonts, defined in fonts by user (using setFont).
      if(fontIndex) {
        for( f in fonts ) {
          putFonts(f);
        }
      } else {
        // if fontIndex still 0, means that setFont was not used, fallback to default
        fonts[font] = 0;
        putFonts(font);            
      }

      
      putImages();
      
      //Resource dictionary
      offsets[2] = buffer.length;
      out('2 0 obj');
      out('<<');
      putResourceDictionary();
      out('>>');
      out('endobj');
    } 
    
    var putFonts = function(font) {
      newObject();
      fontsNumber[font] = objectNumber;
      
      out('<</Type /Font');
      out('/BaseFont /' + font);
      out('/Subtype /Type1');
      out('/Encoding /WinAnsiEncoding');
      out('>>');
      out('endobj');
    }
    
    var putImages = function() {
      // TODO
    }
    
    var _drawLine = function(x1, y1, x2, y2, weight, style) {
      if (typeof weight === "undefined" || weight < 0) {
        weight = 1;
      }
      
      if (typeof style === "undefined") {
        style = '[] 0 d';
      } else {
        if (style === 'dotted') {
          style = '[1 2] 1 d';
        } else if (style === 'dashed') {
          style = '[4 2] 2 d';
        } else {
          style = '[] 0 d';
        }
      }
      
      var str = sprintf('\n/LEP BMC \nq\n0 G\n%.2f w\n%s\n0 J\n1 0 0 1 0 0 cm\n%.2f %.2f m\n%.2f %.2f l\nS\nQ\nEMC\n', weight, style, k*x1, k*(pageHeight-y1), k*x2, k*(pageHeight-y2));
      out(str);
    };
    
    var putResourceDictionary = function() {
      var i = 0, index, fx;
      
      out('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
      out('/Font <<');
      
      // Do this for each font, the '1' bit is the index of the font
      // fontNumber is currently the object number related to 'putFonts'
      for( index in fontsNumber ) {
        out(fonts[index] + ' ' + fontsNumber[index] + ' 0 R');
      }
      
      out('>>');
      out('/XObject <<');
      putXobjectDict();
      out('>>');
    }
    
    var putXobjectDict = function() {
      // TODO
      // Loop through images
    }
    
    
    var putInfo = function() {
      out('/Producer (pdf.js ' + version + ')');
      if(documentProperties.title != undefined) {
        out('/Title (' + pdfEscape(documentProperties.title) + ')');
      }
      if(documentProperties.subject != undefined) {
        out('/Subject (' + pdfEscape(documentProperties.subject) + ')');
      }
      if(documentProperties.author != undefined) {
        out('/Author (' + pdfEscape(documentProperties.author) + ')');
      }
      if(documentProperties.keywords != undefined) {
        out('/Keywords (' + pdfEscape(documentProperties.keywords) + ')');
      }
      if(documentProperties.creator != undefined) {
        out('/Creator (' + pdfEscape(documentProperties.creator) + ')');
      }   
      var created = new Date();
      var year = created.getFullYear();
      var month = (created.getMonth() + 1);
      var day = created.getDate();
      var hour = created.getHours();
      var minute = created.getMinutes();
      var second = created.getSeconds();
      out('/CreationDate (D:' + sprintf('%02d%02d%02d%02d%02d%02d', year, month, day, hour, minute, second) + ')');
    }
    
    var putCatalog = function () {
      out('/Type /Catalog');
      out('/Pages 1 0 R');
      // TODO: Add zoom and layout modes
      out('/OpenAction [3 0 R /FitH null]');
      out('/PageLayout /OneColumn');
    } 
    
    function putTrailer() {
      out('/Size ' + (objectNumber + 1));
      out('/Root ' + objectNumber + ' 0 R');
      out('/Info ' + (objectNumber - 1) + ' 0 R');
    } 
    
    var endDocument = function() {
      state = 1;
      putHeader();
      putPages();
      
      putResources();
      //Info
      newObject();
      out('<<');
      putInfo();
      out('>>');
      out('endobj');
      
      //Catalog
      newObject();
      out('<<');
      putCatalog();
      out('>>');
      out('endobj');
      
      //Cross-ref
      var o = buffer.length;
      out('xref');
      out('0 ' + (objectNumber + 1));
      out('0000000000 65535 f ');
      for (var i=1; i <= objectNumber; i++) {
        out(sprintf('%010d 00000 n ', offsets[i]));
      }
      //Trailer
      out('trailer');
      out('<<');
      putTrailer();
      out('>>');
      out('startxref');
      out(o);
      out('%%EOF');
      state = 3;    
    }
    
    var beginPage = function() {
      page ++;
      // Do dimension stuff
      state = 2;
      pages[page] = '';
      
      // TODO: Hardcoded at A4 and portrait
      pageHeight = pageFormats['a4'][1] / k;
      pageWidth = pageFormats['a4'][0] / k;
    }
    
    var out = function(string) {
      if(state == 2) {
        pages[page] += string + '\n';
      } else {
        buffer += string + '\n';
      }
    }
    
    var _addPage = function() {
      beginPage();
      // Set line width
      out(sprintf('%.2f w', (lineWidth * k)));
      
      // 16 is the font size
      pageFontSize = fontSize;
      pageFont = font;
      out('BT ' + fonts[font] + ' ' + parseInt(fontSize) + '.00 Tf ET');    
    }
    
    // Add the first page automatically
    _addPage(); 

    // Escape text
    var pdfEscape = function(text) {
      return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    }
    
    return {
      addPage: function() {
        _addPage();
      },
      text: function(x, y, text, f) {
        if(f) {
          this.setFont(f);
        }
        
        // need either page height or page font
        if(pageFontSize !== fontSize || pageFont !== font) {
          pageFontSize = fontSize;
          pageFont = font;
        }
        
        var str = sprintf('BT %.2f %.2f Td (%s) Tj ET', x * k, (pageHeight - y) * k, pdfEscape(text))   
        out('BT ' + (fonts[font] ? fonts[font] : '/F0') + ' ' + parseInt(fontSize, 10) + '.00 Tf ET');
        out(str);
      },
      drawRect: function(x, y, w, h, style) {
        var op = 'S';
        if (style === 'F') {
          op = 'f';
        } else if (style === 'FD' || style === 'DF') {
          op = 'B';
        }
        out(sprintf('%.2f %.2f %.2f %.2f re %s', x * k, (pageHeight - y) * k, w * k, -h * k, op));
      },
      drawLine: _drawLine,
      setProperties: function(properties) {
        documentProperties = properties;
      },
      addImage: function(imageData, format, x, y, w, h) {
      
      },
      output: function(type, options) {
        endDocument();
        if(type == undefined) {
          return buffer;
        }
        
        //buffer = utf8_encode(buffer);
        console.log(buffer);
        
        if(type == 'datauri') {
          return 'data:application/pdf;filename='+options.fileName+';base64,' + Base64.encode(buffer);
        }
        // @TODO: Add different output options
      },
      setFontSize: function(size) {
        fontSize = size;
      },
      getFontSize: function() {
        return fontSize;
      },
      setFont: function(f){
        if( !(f in fonts) ) {
          // if not known font yet, add in fonts array, then used in endDocument
          // while putting ressource
          fonts[f] = '/F' + (fontIndex++);
        }
        font = f;
      }
    }

  };

  /**
  *
  *  Base64 encode / decode
  *  http://www.webtoolkit.info/
  *
  **/
   
  // private property
  var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
   
  // public method for encoding
  exports.encode = function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
   
    //input = utf8_encode(input);
   
    while (i < input.length) {
   
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
   
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
   
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
   
      output = output +
      keyStr.charAt(enc1) + keyStr.charAt(enc2) +
      keyStr.charAt(enc3) + keyStr.charAt(enc4);
   
    }
   
    return output;
  }
   
  // public method for decoding
  exports.decode = function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
   
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
   
    while (i < input.length) {
   
      enc1 = keyStr.indexOf(input.charAt(i++));
      enc2 = keyStr.indexOf(input.charAt(i++));
      enc3 = keyStr.indexOf(input.charAt(i++));
      enc4 = keyStr.indexOf(input.charAt(i++));
   
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
   
      output = output + String.fromCharCode(chr1);
   
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
   
    }
   
    output = utf8_decode(output);
   
    return output;
   
  }
  
  // private method for UTF-8 encoding
  function utf8_encode(string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";
   
    for (var n = 0; n < string.length; n++) {
   
      var c = string.charCodeAt(n);
   
      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
   
    }
   
    return utftext;
  }
   
  // private method for UTF-8 decoding
  function utf8_decode(utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;
   
    while ( i < utftext.length ) {
   
      c = utftext.charCodeAt(i);
   
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      }
      else if((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i+1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      }
      else {
        c2 = utftext.charCodeAt(i+1);
        c3 = utftext.charCodeAt(i+2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
   
    }
   
    return string;
  }
   
  /**** BUNDLED SOME EXTRA STUFF FOR THE BROWSER, IF YOU REALLY DONT LIKE THIS HERE IN YOUR NODE VERSION YOU CAN DELETE IT.... SORRY... ******/
  // Modified to work as a CommonJS/NodeJS lib
//      Use:  sprintf = require("sprintf").sprintf

  var sprintf = exports.sprintf = function ( ) {
      // Return a formatted string  
      // 
      // version: 903.3016
      // discuss at: http://phpjs.org/functions/sprintf
      // +   original by: Ash Searle (http://hexmen.com/blog/)
      // + namespaced by: Michael White (http://getsprink.com)
      // +    tweaked by: Jack
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +      input by: Paulo Ricardo F. Santos
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +      input by: Brett Zamir (http://brettz9.blogspot.com)
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // *     example 1: sprintf("%01.2f", 123.1);
      // *     returns 1: 123.10
      // *     example 2: sprintf("[%10s]", 'monkey');
      // *     returns 2: '[    monkey]'
      // *     example 3: sprintf("[%'#10s]", 'monkey');
      // *     returns 3: '[####monkey]'
      var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
      var a = arguments, i = 0, format = a[i++];

      // pad()
      var pad = function(str, len, chr, leftJustify) {
          if (!chr) chr = ' ';
          var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
          return leftJustify ? str + padding : padding + str;
      };

      // justify()
      var justify = function(value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
          var diff = minWidth - value.length;
          if (diff > 0) {
              if (leftJustify || !zeroPad) {
                  value = pad(value, minWidth, customPadChar, leftJustify);
              } else {
                  value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
              }
          }
          return value;
      };

      // formatBaseX()
      var formatBaseX = function(value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
          // Note: casts negative numbers to positive ones
          var number = value >>> 0;
          prefix = prefix && number && {'2': '0b', '8': '0', '16': '0x'}[base] || '';
          value = prefix + pad(number.toString(base), precision || 0, '0', false);
          return justify(value, prefix, leftJustify, minWidth, zeroPad);
      };

      // formatString()
      var formatString = function(value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
          if (precision != null) {
              value = value.slice(0, precision);
          }
          return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
      };

      // doFormat()
      var doFormat = function(substring, valueIndex, flags, minWidth, _, precision, type) {
          var number;
          var prefix;
          var method;
          var textTransform;
          var value;

          if (substring == '%%') return '%';

          // parse flags
          var leftJustify = false, positivePrefix = '', zeroPad = false, prefixBaseX = false, customPadChar = ' ';
          var flagsl = flags.length;
          for (var j = 0; flags && j < flagsl; j++) switch (flags.charAt(j)) {
              case ' ': positivePrefix = ' '; break;
              case '+': positivePrefix = '+'; break;
              case '-': leftJustify = true; break;
              case "'": customPadChar = flags.charAt(j+1); break;
              case '0': zeroPad = true; break;
              case '#': prefixBaseX = true; break;
          }

          // parameters may be null, undefined, empty-string or real valued
          // we want to ignore null, undefined and empty-string values
          if (!minWidth) {
              minWidth = 0;
          } else if (minWidth == '*') {
              minWidth = +a[i++];
          } else if (minWidth.charAt(0) == '*') {
              minWidth = +a[minWidth.slice(1, -1)];
          } else {
              minWidth = +minWidth;
          }

          // Note: undocumented perl feature:
          if (minWidth < 0) {
              minWidth = -minWidth;
              leftJustify = true;
          }

          if (!isFinite(minWidth)) {
              throw new Error('sprintf: (minimum-)width must be finite');
          }

          if (!precision) {
              precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : void(0);
          } else if (precision == '*') {
              precision = +a[i++];
          } else if (precision.charAt(0) == '*') {
              precision = +a[precision.slice(1, -1)];
          } else {
              precision = +precision;
          }

          // grab value using valueIndex if required?
          value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

          switch (type) {
              case 's': return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
              case 'c': return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
              case 'b': return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
              case 'o': return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
              case 'x': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
              case 'X': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
              case 'u': return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
              case 'i':
              case 'd': {
                  number = parseInt(+value);
                  prefix = number < 0 ? '-' : positivePrefix;
                  value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                  return justify(value, prefix, leftJustify, minWidth, zeroPad);
              }
              case 'e':
              case 'E':
              case 'f':
              case 'F':
              case 'g':
              case 'G': {
                  number = +value;
                  prefix = number < 0 ? '-' : positivePrefix;
                  method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                  textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                  value = prefix + Math.abs(number)[method](precision);
                  return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
              }
              default: return substring;
          }
      };

      return format.replace(regex, doFormat);
  }

  
  $.bridge('pdf', {
    options: {
      tags: 'h1 h2 h3 h4 h5 h6 a p blockquote ul li code'.split(' '),
      
      config: {
        marginL: 15,
        baseLine: 6,
        pageLineNb: 47,
        baseFontSize: 10,
        baseFont: 'Times-Roman'
      },
      
      properties: {
        title: 'A test at the DOM with pdf.js',
        subject: 'PDFs are kinda cool, i guess',
        author: 'Your Name here',
        keywords: 'pdf.js, javascript, dom',
        creator: 'pdf.js'
      }
    },
    
    init: function(options, element) {
      this.options = $.extend({}, this.options, options);
      this.element = $(element);
      this.dom = element;
      
      this.doc = new pdf();

      // special line incrementor, attached to instance rather than prototype
      this.line = (function() {
          var l = 2,
          config = this.options.config,
          doc = this.doc;
          
          return {
              line: function() {
                  return l;
              },
  
              increment: function(val) {
                  l = l + (val || 1);
  
                  if (l % config.pageLineNb === 0) {
                      doc.addPage();
                      l = 2;
                  }
  
                  return l;
              }
          };
      }).call(this);
      
      this.createDoc();
      
      this.link = $('<a />', {href: this.datauri}).text('Generate PDF')
          .insertBefore(this.element);
    },
    
    walker: function walker(el, cb) {
      cb(el);
      el = el.firstChild;
      while (el) {
          this.walker(el, cb);
          el = el.nextSibling;
      }
    },
    
    createDoc: function createDoc() {
      var doc = this.doc,
      _text = doc.text,
      line = this.line,
      config = this.options.config,
      fileName;

      // set up pdf document meta-informations
      doc.setProperties(this.options.properties);
      
      // proxy that text method
      doc.text = function(marginLeft, text, font, doNotEscape) {
          var m = [],
          
          self = this,

          font = font || 'Helvetica';

          text = doNotEscape ? $.trim(text) : $.trim(text).replace(/\n/g, ' ');
          
          // special loic char escape...
          // ’ --> ' “ --> " ” --> "
          text = text.replace(/’/g, "'")
            .replace(/“|”/g, '"');

          if (text.length > 70) {
              m = text.match(/.{0,120}[\s|\.|:|>|}|;]/gim);
              $.each(m, function(i, val) {
                  _text.call(self, marginLeft, config.baseLine * line.line(), val, font);
                  line.increment();
              });
          } else if (/\n/.test(text)) {
              m = text.split(/\n/gim);
              $.each(m, function(i, val) {
                  _text.call(self, marginLeft, config.baseLine * line.line(), val, font);
                  line.increment();
              });
          } else {
              _text.call(self, marginLeft, config.baseLine * line.line(), text, font);
          }

          line.increment();
      };
      
      this.walker(this.dom,  $.proxy(this.nodeHandler, this));

      filename = "testFile" + new Date().getSeconds() + ".pdf";
      
      return this.datauri = doc.output('datauri', {fileName: filename});
    },
    
    nodeHandler: function nodeHandler(node) {
      var t = node.nodeName.toLowerCase(),
      lineLn = 0,
      config = this.options.config,
      tags = this.options.tags,
      doc = this.doc,
      line = this.line,
      text = "",
      m, marginL, fontSize, font;

      if ((node.nodeType !== 1) || $.inArray(t, tags) === -1) {
          return;
      }

      marginL = t === 'ul' || t === 'li' ? config.marginL + 10:
          t === 'p' ? config.marginL + 5:
          t === 'blockquote' ? config.marginL + 25:
          t === 'code' ? config.marginL + 10:
          config.marginL;

      fontSize = /ul|li|p|code|blockquote/.test(t) ? config.baseFontSize :
        /h5|h6/.test(t) ? 14 :
        t === 'h1' ? 22 :
        t === 'h2' ? 20 :          
        t === 'h3' ? 18 :
        t === 'h4' ? 16 : 
        config.baseFontSize;
      
      font = /ul|li|p|blockquote/.test(t) ? config.baseFont :
        /h[1-6]/.test(t) ? 'Helvetica' :
        t === 'code' ? 'Courrier' :
        config.baseFont

      text = $(node).text();
      
      if (t === 'h1') {
          line.increment();
          doc.setFontSize(fontSize);
          doc.text(marginL, text, font);
      } else if (t === 'h2') {
          doc.setFontSize(fontSize);
          line.increment();
          doc.text(marginL, text, font);
      } else if (t === 'h3') {
          line.increment();
          doc.setFontSize(fontSize);
          doc.text(marginL, text, font);
      } else if (t === 'h4') {
          line.increment();
          doc.setFontSize(fontSize);
          doc.text(marginL, text, font);
      } else if (t === 'h5') {
          line.increment();
          doc.setFontSize(fontSize);
          doc.text(marginL, text, font);
      } else if (t === 'h6') {
          doc.setFontSize(fontSize);
          doc.text(marginL, text, font);
      } else if (t === 'p' && /div|header/.test(node.parentNode.nodeName.toLowerCase())) {
          doc.setFontSize(fontSize);
          doc.text(marginL, text, font);
      } else if (t === 'ul') {
          doc.setFontSize(fontSize);
      } else if (t === 'li') {
          doc.setFontSize(fontSize);
          doc.text(marginL, ' * ' + text, font);
      } else if (t === 'blockquote') {
          doc.setFontSize(fontSize);
          doc.text(marginL, text, 'Times-Roman', font);
      } else if (t === 'code' && /\n/.test(text)) {
          doc.setFontSize(fontSize);
          doc.text(marginL, text, 'Courier', true);
      }
    }
  });
  
})(this.jQuery, this);