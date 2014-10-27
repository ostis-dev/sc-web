PdfComponent = {
    formats: ['format_pdf'],
    factory: function(sandbox) {
        return new PdfViewer(sandbox);
    }
};

var PdfViewer = function(sandbox){
    var self = this;
	
    self.container = '#' + sandbox.container;
    self.sandbox = sandbox;
    self.pageCount = 0;
    self.pageNum = 1;
    self.pdfDoc = null;
    self.pageRendering = false;
    self.pageNumPending = null;
    self.scale = 1.0;
    self.canvas = null;
    self.ctx = null;
    self.id = 0;

    // ---- window interface -----
    self.receiveData = function(data) {
        var dfd = new jQuery.Deferred();

        $(self.container).empty();

        self.id = Math.floor(Math.random() * (100000 - 0) + 0);  
        self.createHtml();

        $('#pdf_next_page' + self.id).click(function(){
            self.nextPage();
        });

        $('#pdf_prev_page' + self.id).click(function(){
            self.prevPage();
        });

        $('#pdf_go_to_page_button' + self.id).click(function(){
            self.goToPage();
        });

        $('#pdf_canvas' + self.id).click(function(){
            window.open(location.origin + "/" + data);
        });

        self.viewPdf(data);

        dfd.resolve();
        return dfd.promise();
    };
  
    self.createHtml = function(){	
        var mainPdfDiv = '<div id="pdf' + self.id + '"></div>';
        $(self.container).append(mainPdfDiv);

        var controlsDiv = '<div id="cotrols' + self.id +'"></div>';
        $('#pdf' + self.id).append(controlsDiv);

        var prevButton = '<button id="pdf_prev_page' +self.id + '" style="margin: 10px;">Prev page</button>';
        var nextButton = '<button id="pdf_next_page' +self.id + '" style="margin: 10px;">Next page</button>';
        var pageCounter = '<span style="margin: 10px;">Page: <span id="pdf_page_number' +self.id + '"></span> / <span id="pdf_page_count' +self.id + '"></span></span>'

        var inputGoTo = '<input type="text" id="pdf_go_to_page' + self.id + '"/>';
        var buttonGoTo = '<button id="pdf_go_to_page_button' + self.id + '">Go to page</button>';

        $('#cotrols' + self.id).append(prevButton);
        $('#cotrols' + self.id).append(pageCounter);
        $('#cotrols' + self.id).append(nextButton);
        $('#cotrols' + self.id).append(inputGoTo);
        $('#cotrols' + self.id).append(buttonGoTo);

        var canvasDiv = '<canvas id="pdf_canvas' + self.id + '" style="border:1px solid black"></canvas>'
        $('#pdf' + self.id).append(canvasDiv);       

    };
    
    self.viewPdf = function (url){
        self.canvas = document.getElementById('pdf_canvas'  + self.id);
	self.ctx = self.canvas.getContext('2d');
	
	PDFJS.disableWorker = true;
	PDFJS.getDocument(url).then(function (pdfDoc_) {
	    self.pdfDoc = pdfDoc_;
		
	    document.getElementById('pdf_page_count' + self.id).textContent = self.pdfDoc.numPages;
	    self.pageCount = self.pdfDoc.numPages;
	    self.renderPage(self.pageNum);
	});
    };

    self.renderPage = function(num) {
        self.pageRendering = true;

        self.pdfDoc.getPage(num).then(function(page) {

            var viewport = page.getViewport(self.scale);
            self.canvas.height = viewport.height;
            self.canvas.width = viewport.width;
	
            var renderContext = {
                canvasContext: self.ctx,
                viewport: viewport
            };
	
            var renderTask = page.render(renderContext);

            renderTask.promise.then(function () {
                self.pageRendering = false;

                if (self.pageNumPending !== null) {
                    self.renderPage(pageNumPending);
                    self.pageNumPending = null;
                }
            });
        });
        document.getElementById('pdf_page_number'  + self.id).textContent = self.pageNum;
    };

    self.queueRenderPage = function (num) {
        if (self.pageRendering) {
	    self.pageNumPending = num;
        } else {
	    self.renderPage(num);
        }
    };

    self.nextPage = function(){
        if (self.pageNum >= self.pdfDoc.numPages) {
	    return;
     	}
   	self.pageNum++;
   	self.queueRenderPage(self.pageNum);   
    };

    self.prevPage = function(){
    	if (self.pageNum <= 1) {
	    return;
        }
        self.pageNum--;
        self.queueRenderPage(self.pageNum);   
    };

    self.goToPage = function(){
        var pageNo = document.getElementById('pdf_go_to_page' + self.id).value;	  
        pageNo = +pageNo;
  
  	if(!!pageNo === false || pageNo < 1 || pageNo > self.pageCount){
	    $('#pdf_go_to_page' + self.id).val(1);
	    self.pageNum = 1;
	    self.renderPage(1);
	    return;
        }
  
        self.pageNum = pageNo;
        self.queueRenderPage(self.pageNum);
    }

    if (self.sandbox.addr) {
        self.receiveData('api/link/content/?addr=' + self.sandbox.addr);
    }
};

SCWeb.core.ComponentManager.appendComponentInitialize(PdfComponent);
