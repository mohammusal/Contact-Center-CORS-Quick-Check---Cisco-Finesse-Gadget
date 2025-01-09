var finesse = finesse || {};
finesse.gadget = finesse.gadget || {};
finesse.container = finesse.container || {};

/*global logFinesse */

/** @namespace */
finesse.modules = finesse.modules || {};
finesse.modules.gadget = (function ($) {

    var clientLogs, user, states;
    const finesseStatusURL= '/finesse/api/SystemInfo/'  // this is the same for CORS URL


    handleUserLoad = function (userevent) {

        render();
    };

    
    CORS =function () {

        const fqdn = $('#fqdn').val();
        const product = $('#Product').val();
      
      if (fqdn === '' && !(product ==='3rd'))
      {
       $('#result').html("Empty FQDN/IP!, please re-enter proper IP or FQDN").css('color', 'red');
      throw new error ("Empty FQDN/IP, please re-enter proper IP or FQDN");
      
      }
      
       console.log("the selected product by the user is" +product)
      
        if (product === '')
          {
          $('#result').html("please select the product from top down list").css('color', 'red');
          throw new error ("please select the product from top down list");
          
          }
      
      
        if (product=== 'cuic')  
        { resourceurl="/cuic/"
          console.log("the resource URL is CUIC");
      
        };
        
        
        if ( product === 'finesse') 
        { resourceurl= finesseStatusURL 
          console.log("the resource URL is Finesse");
        };
      
      
        
        if ( product ==='3rd')
        {
          url = $('#otherInput').val();

          if (isValidUrl(url)){apiURL=url }
          else {$('#result').html('Invalid URL Format ✘').css('color', 'red');}
          console.log("the resource URL is 3rd party product is"+apiURL)
        }
      
      
      if ((!validateIPorFQDN(fqdn))&&(!(product ==='3rd'))) {
        $('#result').html('Invalid IP or FQDN ✘').css('color', 'red');
        throw "Invalid IP or FQDN "
      }
      
      
      if (!(product ==='3rd')){
         apiURL = 'https://'+fqdn+resourceurl;
      }
            
      
      
         response = fetch(apiURL,{
            method: "OPTIONS",
            mode: "cors",
            redirect: "follow",
          } ) 
          
          
          .then(response => {    
      
              console.log(" the response status code is"+response.status);
              if(response.status ===200 || response.status ===204) {
            
                if (response.headers.get('Access-Control-Allow-Origin')=== '*') {
                $('#result').html(" CORS is enabled for all origins ✔").css('color', 'green');
                }
                else
                $('#result').html(" CORS Preflight Test Suceeded ✔").css('color', 'green');
                     
          }
      
          else {
            throw new Error('Network response was not ok');
        }
                 
          })
       
          
       .catch(error => {               
        $('#result').html( "CORS Preflight Test failed ✘").css('color', 'red');

          })
      
          
      };
      

    validateIPorFQDN= function (input) {

        /* the logic of the code could be eaiser :
        
        ^: Matches the beginning of the input string.
        (25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?): Matches a single decimal number between 0 and 255. This part is repeated four times for each octet of the IP address.
        25[0-5]: Matches numbers from 250 to 255.
        2[0-4][0-9]: Matches numbers from 200 to 249.
        [01]?[0-9][0-9]?: Matches numbers from 0 to 199.   
        \.: Matches a literal period (dot).
        $: Matches the end of the input string.
        
        
        */
         const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        
        
        /*
        ^: Matches the beginning of the input string.
        (?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+: Matches one or more domain labels, each consisting of:
        A letter or number.
        Zero or more hyphens or letters/numbers (up to 61 characters).
        A dot.
        [a-z0-9][a-z0-9-]{0,61}[a-z0-9]$: Matches the top-level domain (TLD), which must start and end with a letter or number, and can have zero or more hyphens or letters/numbers in between (up to 61 characters).
        $: Matches the end of the input string.
        
        */
        
        
        
         const fqdnRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
        
        
        
          // Check if the input matches either the IP or FQDN pattern
          return ipRegex.test(input) || fqdnRegex.test(input)
        };
        
       
    showInput = function () {
  
          
        const selectElement = $('#Product').val();
        const inputField = $('#inputField');
        const fulldn = $('#fqdn1');
          
          
        if (selectElement === "3rd") {
            inputField.show()
            fulldn.hide();
              
          
        } else {
            inputField.hide()
            fulldn.show()
            }
        } ;

    isValidUrl= function (url) {
          const urlRegex= /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
          return urlRegex.test(url);
        }
      
        

    /** @scope finesse.modules.gadget */
    return {
            

        init : function () {

            var config = finesse.gadget.Config;
            $('#Product').on("change",showInput);
            //btnEl.on("click", CORS);
            $('#btn').on("click", CORS);

            gadgets.window.adjustHeight('1000');

            // Initiate the ClientServices and load the user object.  ClientServices are
            // initialized with a reference to the current configuration.
            finesse.clientservices.ClientServices.init(config);

            // Hookup connect and disconnect handlers so that buttons can be disabled while failing over.
            //
            finesse.clientservices.ClientServices.registerOnConnectHandler(function() {
                connected = true;
                render();
            });
            finesse.clientservices.ClientServices.registerOnDisconnectHandler(function() {
                connected = false;
                render();
            });

            clientLogs.init(gadgets.Hub, "TroubleshootingGadget"); //this gadget id will be logged as a part of the message
            user = new finesse.restservices.User({
                id: config.id,
                onLoad : handleUserLoad
            });

            // Initiate the ContainerServices and add a handler for when the tab is visible
            // to adjust the height of this gadget in case the tab was not visible
            // when the html was rendered (adjustHeight only works when tab is visible)
            states = finesse.restservices.User.States;

            containerServices = finesse.containerservices.ContainerServices.init();
            containerServices.addHandler(finesse.containerservices.ContainerServices.Topics.ACTIVE_TAB, function(){
                clientLogs.log("Gadget is now visible");  // log to Finesse logger
            });
            containerServices.makeActiveTabReq();
            

        }
    };

    
}(jQuery));

   
    
    
    