//helper tool to download
//define for requirejs
define(["config", "apiEndPoints", "tools/Multipass"],function(config, api, Multipass){
  var multipass = new Multipass()

  var nemo = "http://"+config.NEMO_LOCATION+":"+config.NEMO_PORT
  var Downloader = function() {
  };

  Downloader.prototype = {
      getFileKeys: function(linknames, callback){
          var request = {filenames:linknames}

          var xhr = new XMLHttpRequest();
          xhr.open('POST', api.getFileKeys, true);
          xhr.responseType = 'text';
          xhr.onload = function(e) {
            if (this.status == 200) {
              console.log(this.response);
              try {
                  var fileKeys = JSON.parse(this.response).return
                  var fileKeysObj = {}
                  // save the key and ts for each file
                  fileKeys.forEach(function(fileKey){ fileKeysObj[fileKey.filename] = {key:fileKey.key, ts: fileKey.ts}  })
              }catch(err){
                  //I really shouldn't have to this so often, so call stack should be fine
                  console.error('There was an error',err)
                  Downloader.prototype.getFileKeys(linknames, callback);
                  return;
              }
              if (typeof callback != 'undefined') callback(fileKeysObj)
            }
          };

          var data = request

          multipass.checkMultipass(data)
                   .then(_.bind(xhr.send, xhr));
      },

      downloadFile: function(linkname, keyObj, progressListener, callback){
          if (progressListener) progressListener({event:"Downloading", progress:0});

          var url = "/download/<%=filename%>/<%=ts%>/<%=key%>" 
          , key = keyObj.key
          , ts = keyObj.ts

          url = _.template(url, {filename:linkname, key:key, ts:ts})

          var request = {command:"downloadFile",filename:linkname,key:key,"meta":{"http":true}}

          var xhr = new XMLHttpRequest()
          xhr.open('GET', url, true)

          xhr.responseType = 'arraybuffer'
          xhr.setRequestHeader('Content-Type','text/plain')

          xhr.onload = function(e) {
            if (this.status == 200) {
              //console.log(this.response);
              if (callback) callback(this.response)
              if (progressListener) progressListener({event:"Downloading", progress:100});
            }
          };

          var downloadFile = this.downloadFile
          , that = this
          xhr.onerror = function(e){
              console.error("there was an error",e)
              downloadFile.apply(that,[linkname, key, progressListener, callback])
          }
          xhr.onprogress = function(e){
              if (e.lengthComputable){
                  var progress = (e.loaded / e.total) * 100;
                  if (progressListener) progressListener({event:"Downloading", progress:progress});
              }
          }
  
          xhr.send();
          
      },

      //a helper function
      getKeyAndDownload: function(linkname, callback){
          this.getFileKeys([linkname], _.bind(function(fileKeyObj){
              var key = _.values(fileKeyObj)[0]
              this.downloadFile(linkname,key, null, callback)
          },this))
      }
  }

  return Downloader
})
