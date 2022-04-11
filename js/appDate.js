(function(window, document, undefined){

    window.onload = init;
    
    // index.html : Generates the API call with the city's selection
    function init(){

        const URL_PARAMS = new URLSearchParams(window.location.search);
        const date = URL_PARAMS.get('date');

        document.querySelector('#language0').addEventListener('click', () => {
            document.querySelector('#language').value = 0;
            TITLE.innerHTML = mapEnglish.get("Weather");
            SELECT.children[0].textContent = 'Select a country';
            SELECT.value = 0;
            reinitialize();
        })
        
        document.querySelector('#language1').addEventListener('click', () => {
            document.querySelector('#language').value = 1;
            TITLE.innerHTML = mapHebrew.get("Weather");
            SELECT.children[0].textContent = 'בחר מדינה';
            SELECT.value = 0;
            reinitialize();
        })
        
        selectCountry(date);
    }

})(window, document, undefined);