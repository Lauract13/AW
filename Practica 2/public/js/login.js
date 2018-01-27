"use strict";

$(() => {

    let authUser = null;
    let authPassword = null;
    let base64user = null;

    $("#loginBtn").on("click", () => {
        let user = $("#usernameInput").val();
        let password = $("#passwordInput").val();
        $.ajax({
            type: "POST",
            url: "/users/login",
            contentType: "application/json",
            data: JSON.stringify({ user: user, password: password }),
            success: (data, textStatus, jqXHR) => {
                let response = JSON.parse(jqXHR.responseText);
                console.log(jqXHR);
                if (response.found) {
                    base64user = btoa(user + ":" + password);
                    authUser = user;
                    authPassword = password;
                    $.ajax({
                        method: "GET",
                        url: "/users/perfil",
                        beforeSend: function(req) {
                            req.setRequestHeader("Authorization", "Basic " + base64user);
                        },
                        success: (data, textStatus, jqXHR) => {
                            if (data.permitido) {
                                console.log("vamos loco");
                            } else {
                                console.log("acceso restringido");
                            }
                        },
                        error: (jqXHR, textStatus, errorThrown) => {
                            console.log("buah");
                        }
                    });
                } else {
                    $("#errorTxt").text("No encontrado");
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                $("#errorTxt").text("No se pudo conectar. Intentalo de nuevo mas tarde.");
            }
        });
    });

    $("#newUserBtn").on("click", () => {
        let user = $("#usernameInput").val();
        let password = $("#passwordInput").val();
        $.ajax({
            type: "POST",
            url: "/users/newUser",
            contentType: "application/json",
            data: JSON.stringify({ user: user, password: password }),
            success: (data, textStatus, jqXHR) => {
                $("#errorTxt").text("Creado");
            },
            error: (jqXHR, textStatus, errorThrown) => {
                if (jqXHR.status === 400) {
                    $("#errorTxt").text("Usuario ya existente");
                } else if (jqXHR.status === 500) {
                    $("#errorTxt").text("No se pudo conectar. Intentalo de nuevo.");
                }
            }
        });
    });

    $("#newPartidaBtn").on("click", () => {
        let nombre = $("#nombrePartidaInput").val();

        $.ajax({
            type: "POST",
            url: "/partidas/newPartida",
            beforeSend: function(req) {
                req.setRequestHeader("Authorization", "Basic " + base64user);
            },
            contentType: "application/json",
            data: JSON.stringify({ nombre: nombre }),
            success: (data, textStatus, jqXHR) => {
                $("#errorTxt").text("Creada");

            },
            error: (jqXHR, textStatus, errorThrown) => {
                if (jqXHR.status === 500) {
                    $("#errorTxt").text("No se pudo conectar. Intentalo de nuevo.");
                }
            }
        });
    });

});