"use strict";

function createTab(id, nombre) {
    let html = '<div id="' + id + '" class="tab-pane fade gameTab">\n';
    html += '<div class="infoPart">\n';
    html += '<div class="col-md-6 col-md-offset-1 datosPartida">\n';
    html += '<label class="col-md-9 control-labelPerfil">Partida ' + nombre + '</label>\n';
    html += '<button type="button" class="col-md-3 btn btn-primary" id="actPartBtn' + id + '">Actualizar Partida</button>\n';
    html += '<p class="col-md-10">La partida aun no tiene cuatro jugadores</p>\n';
    html += '<p class="col-md-10">El identificador de la partida es ' + id + '</p>\n';
    html += '</div>\n';
    html += '<div class="col-md-3 col-md-offset-1 infoJugadores">\n';
    html += '<p>Jugadores</p>\n';
    html += '<table class="table table-condensed">\n';
    html += '<thead>\n';
    html += '<tr>\n';
    html += '<th>Jugadores</th>\n';
    html += '<th>Nº Cartas</th>\n';
    html += '</tr>\n';
    html += '</thead>\n';
    html += '<tbody>\n';
    html += '<tr>\n';
    html += '<td>Jugador 1</td>\n';
    html += '<td>--</td>\n';
    html += '</tr>\n';
    html += '</tbody>\n';
    html += '</table>\n';
    html += '</div>\n';
    return html;
}

$(() => {

    let authUser = null;
    let authPassword = null;
    let authId = null;
    let base64user = null;

    $("#unirseBtn").on("click", () => {
        let idJugador = authId;
        let nombreJugador = authUser;
        let idPartida = $("#unirseId").val();

        $.ajax({
            type: "POST",
            url: "/partidas/unirsePartida",
            contentType: "application/json",
            beforeSend: function(req) {
                if (base64user) {
                    req.setRequestHeader("Authorization", "Basic " + base64user);
                }
            },
            data: JSON.stringify({ idPartida: idPartida, idJugador: idJugador, nomJugador: nombreJugador }),
            success: (data, textStatus, jqXHR) => {
                let tab = '<li class="gameTabList"><a data-toggle="tab" href="#' + idPartida + '">' + data.nomPartida + '</a></li>';
                $("#tabsPartidas").append(tab);
                let html = createTab(idPartida, data.nomPartida);
                $("#tabContent").append(html);
                $("#errorTxtPartida").text("Se ha unido a la partida");
            },
            error: (jqXHR, textStatus, errorThrown) => {
                if (jqXHR.status === 401) {
                    base64user = null;
                    authUser = null;
                    authPassword = null;
                    authId = null;
                    $("#titleUser").text("");
                    $("#titleUser").addClass("hidden");
                    $("#disconnectBtn").addClass("hidden");
                    $("#loginContainer").removeClass("hidden");
                    $("#profileContainer").addClass("hidden");
                    $("#errorTxt").text("Necesitas hacer login.");
                } else if (jqXHR.status === 500) {
                    $("#errorTxtPartida").text("No se pudo conectar. Intentalo de nuevo mas tarde.");
                }
            }
        });
    });

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
                if (response.found) {
                    base64user = btoa(user + ":" + password);
                    authUser = user;
                    authPassword = password;
                    authId = response.userId;
                    $("#titleUser").text(user);
                    $("#titleUser").removeClass("hidden");
                    $("#disconnectBtn").removeClass("hidden");
                    $("#loginContainer").addClass("hidden");
                    $("#profileContainer").removeClass("hidden");
                    $.ajax({
                        type: "GET",
                        url: "/partidas/partidasJugador",
                        contentType: "application/json",
                        beforeSend: function(req) {
                            if (base64user) {
                                req.setRequestHeader("Authorization", "Basic " + base64user);
                            }
                        },
                        data: { id: authId },
                        success: (data, textStatus, jqXHR) => {
                            data.forEach(d => {
                                let tab = '<li class="gameTabList"><a data-toggle="tab" href="#' + d.id + '">' + d.nombre + '</a></li>';
                                $("#tabsPartidas").append(tab);
                                let html = createTab(d.id, d.nombre);
                                $("#tabContent").append(html);
                            });
                        },
                        error: (jqXHR, textStatus, errorThrown) => {
                            $("#errorTxtPartida").text("No se pudieron cargar las partidas.");
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

    $("#disconnectBtn").on("click", () => {
        base64user = null;
        authUser = null;
        authPassword = null;
        authId = null;
        $("#misPartidas").addClass("active");
        $("#titleUser").text("");
        $("#titleUser").addClass("hidden");
        $("#disconnectBtn").addClass("hidden");
        $("#loginContainer").removeClass("hidden");
        $("#profileContainer").addClass("hidden");
        $(".gameTab").remove();
        $(".gameTabList").remove();
    })

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
        let idJugador = authId;
        let nomJugador = authUser;

        $.ajax({
            type: "POST",
            url: "/partidas/newPartida",
            beforeSend: function(req) {
                if (base64user) {
                    req.setRequestHeader("Authorization", "Basic " + base64user);
                }
            },
            contentType: "application/json",
            data: JSON.stringify({ nombre: nombre, idJugador: idJugador, nomJugador: nomJugador }),
            success: (data, textStatus, jqXHR) => {
                let tab = '<li class="gameTabList"><a data-toggle="tab" href="#' + data.idPartida + '">' + nombre + '</a></li>';
                $("#tabsPartidas").append(tab);
                let html = createTab(data.idPartida, nombre);
                $("#tabContent").append(html);
                $("#errorTxtPartida").text("Partida creada con nombre " + nombre);
            },
            error: (jqXHR, textStatus, errorThrown) => {
                if (jqXHR.status === 401) {
                    base64user = null;
                    authUser = null;
                    authPassword = null;
                    authId = null;
                    $("#titleUser").text("");
                    $("#titleUser").addClass("hidden");
                    $("#disconnectBtn").addClass("hidden");
                    $("#loginContainer").removeClass("hidden");
                    $("#profileContainer").addClass("hidden");
                    $("#errorTxt").text("Necesitas hacer login.");
                } else if (jqXHR.status === 500) {
                    $("#errorTxtPartida").text("No se pudo conectar. Intentalo de nuevo.");
                }
            }
        });
    });

});