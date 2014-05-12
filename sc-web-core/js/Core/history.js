/**
 * Object controls history of dialog
 * It can fires next events:
 * - "history/add" - this event emits on new history item add. Parameters: addr
 * where:
 *      - addr - is a sc-addr of history item;
 */
SCWeb.core.DialogHistory = {
    
    init: function() {
        var dfd = new jQuery.Deferred();
        
        dfd.resolve();
        return dfd.promise();
    },
     $('#history_button').click(function () {
              SCWeb.core.Server.getHistory( function(historyList){
                  var records = [];
                  var rev_records = [];
                  var record = '';
                  for (var i in historyList)
                  { 
                  SCWeb.core.Server.resolveIdentifiers(historyList[i], function(resolvedList){
                          var  idn = 0;
                          for (var j in resolvedList)
                          {   
                              if (idn == 0)
                              {
                                  record += ' Запрос : '+resolvedList[j]+'\n'; 
                              }
                              if (idn == 1)
                              {
                                  record += ' Ответ‚: '+resolvedList[j]+'\n';
                                  rev_records.push(record);
                              }
                              idn++;
                          }

                      });
                  }
                  records = rev_records.reverse();
                  stringBuilder = '';
                  for(var i in records)
                  {
                       stringBuilder += records[i];
                  }
                  alert(stringBuilder);
               
              });
        }); 
};
