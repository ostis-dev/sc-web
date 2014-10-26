function Viewer () {
		var self = this;
		
		self.pageCount = 0;
		self.pageNum = 1;
		self.pdfDoc = null;
		self.pageRendering = false;
		self.pageNumPending = null;
		self.scale = 1.0;
		self.canvas = null;
		self.ctx = null;
		self.id = 0;
	
		
		
		self.viewPdf = function (url, id){
			self.id = id;
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
	  
}


