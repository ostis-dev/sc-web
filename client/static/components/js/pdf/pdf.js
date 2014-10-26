PdfComponent = {
    formats: ['format_pdf'],
    factory: function(sandbox) {
        return new PdfViewer(sandbox);
    }
};



var PdfViewer = function(sandbox){
	var self = this;
	
    this.container = '#' + sandbox.container;
    this.sandbox = sandbox;

    // ---- window interface -----
    this.receiveData = function(data) {
        var dfd = new jQuery.Deferred();

        $(this.container).empty();
        
        var uniqId = Math.floor(Math.random() * (100000 - 0) + 0);  
        var viewer = new Viewer();
	
        self.createHtml(uniqId, this.container);
        
        $('#pdf_next_page' + uniqId).click(function(){
           viewer.nextPage();
        });
        
        $('#pdf_prev_page' + uniqId).click(function(){
            viewer.prevPage();
        });
        
        $('#pdf_go_to_page_button' + uniqId).click(function(){
            viewer.goToPage();
        });
        
        $('#pdf_canvas' + uniqId).click(function(){
            window.open(location.origin + "/" + data);
        });
        
        viewer.viewPdf(data, uniqId);
        
        dfd.resolve();
        return dfd.promise();
    };
    
        
    this.createHtml = function(id, container){	
       var mainPdfDiv = '<div id="pdf' + id + '"></div>';
       $(container).append(mainPdfDiv);
       
       var controlsDiv = '<div id="cotrols' + id +'"></div>';
       $('#pdf' + id).append(controlsDiv);
       
       var prevButton = '<button id="pdf_prev_page' + id + '" style="margin: 10px;">Prev page</button>';
       var nextButton = '<button id="pdf_next_page' + id + '" style="margin: 10px;">Next page</button>';
       var pageCounter = '<span style="margin: 10px;">Page: <span id="pdf_page_number' + id + '"></span> / <span id="pdf_page_count' + id + '"></span></span>'
       
       var inputGoTo = '<input type="text" id="pdf_go_to_page' + id + '"/>';
       var buttonGoTo = '<button id="pdf_go_to_page_button' + id + '">Go to page</button>';
       
       $('#cotrols' + id).append(prevButton);
       $('#cotrols' + id).append(pageCounter);
       $('#cotrols' + id).append(nextButton);
       $('#cotrols' + id).append(inputGoTo);
       $('#cotrols' + id).append(buttonGoTo);
       
       
       var canvasDiv = '<canvas id="pdf_canvas' + id + '" style="border:1px solid black"></canvas>'
       $('#pdf' + id).append(canvasDiv);       

    };
    
    if (this.sandbox.addr) {
        this.receiveData('api/link/content/?addr=' + this.sandbox.addr);
    }
};


SCWeb.core.ComponentManager.appendComponentInitialize(PdfComponent);
