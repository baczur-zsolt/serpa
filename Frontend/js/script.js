document.addEventListener("DOMContentLoaded", function(){
    
    const namespace=document.getElementById('namespace');

    function loadPage(){
        fetch('/vizsgamunkaMVC/username')
        .then(response=>{
            if (!response.ok) {
                throw new Error("Nem sikerült a lekérdezés!");
            }
            return response.json();
        })
        .then(data=>{
            namespace.innerHTML="Üdv "+data[0]['first_name']+" "+data[0]['last_name']+"!";
        })
        .catch((error) => {
            alert(error);
        })           
    }

    loadPage();
});