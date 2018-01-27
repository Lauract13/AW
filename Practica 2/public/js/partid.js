"use strict";

$(() => {


    $("#newPartidaBtn").on("click", () => {
        let nombre = $("#newPartida").val();
       console.log(nombre);
        $.ajax({
            type: "POST",
            url: "/partidas/newPartida",
            contentType: "application/json",
            data: JSON.stringify({ nombre: nombre }),
            success: (data, textStatus, jqXHR) => {
                $("#errorTxt").text("Creada");
                console.log("ajax");
            },
            error: (jqXHR, textStatus, errorThrown) => {
                if (jqXHR.status === 500) {
                    $("#errorTxt").text("No se pudo conectar. Intentalo de nuevo.");
                }
            }
        });
    });

});