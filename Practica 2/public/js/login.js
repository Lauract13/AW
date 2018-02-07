"use strict";

let authUser = null;
let authPassword = null;
let authId = null;
let base64user = null;

function createTab(id, nombre, estado) {
    let html = '<div id="' + id + '" class="tab-pane fade gameTab">\n';
    html += '<div class="infoPart">\n';
    html += '<div class="col-md-6 col-md-offset-1 datosPartida">\n';
    html += '<label class="col-md-9 control-labelPerfil">Partida ' + nombre + '</label>\n';
    html += '<button type="button" class="col-md-3 btn btn-primary actPartBtn" id="' + id + '">Actualizar Partida</button>\n';
    if (estado.jugadoresEnPartida.length < 4) {
        html += '<p class="col-md-10" id="fullPlayersTxt' + id + '">La partida aun no tiene cuatro jugadores</p>\n';
    } else {
        html += '<p class="col-md-10" id="fullPlayersTxt' + id + '">La partida tiene cuatro jugadores</p>\n';
    }
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
    html += '<tbody id="tablaJugadoresPartida' + id + '">\n';
    for (let i = 0; i < estado.jugadoresEnPartida.length; ++i) {
        html += '<tr class="jugadoresPartida' + id + '">\n';
        html += '<td>' + estado.jugadoresEnPartida[i].nomJugador + '</td>\n';
        html += '<td>' + estado.cartasJugador[i].cartas.length + '</td>\n';
        html += '</tr>\n';
    }
    html += '</tbody>\n';
    html += '</table>\n';
    html += '</div>\n';

    if (estado.jugadoresEnPartida.length === 4) {
        html += '<div class="col-md-6 col-md-offset-1 datosPartida">\n';
        html += '<label class="col-md-9 control-labelPerfil">Cartas en la mesa</label>\n';

        for (let j = 0; j < estado.cartasEnMesa.length; j++) {
            html += '<p class="col-md-10">' + estado.cartasEnMesa[j] + '</p>\n';
        }
        if(estado.ultimoMovimiento.cartasJugadas.length == 1){
            html += '<p class="col-md-10">' + estado.ultimoMovimiento.idJugador + " dice que ha colocado un " + estado.ultimoMovimiento.cartasJugadas[1]+ '</p>\n';
            
        }else if(estado.ultimoMovimiento.cartasJugadas.length == 2){
            html += '<p class="col-md-10">' + estado.ultimoMovimiento.idJugador + " dice que ha colocado dos " + estado.ultimoMovimiento.cartasJugadas[1]+ '</p>\n';
            
        }else if(estado.ultimoMovimiento.cartasJugadas.length == 3){
            html += '<p class="col-md-10">' + estado.ultimoMovimiento.idJugador + " dice que ha colocado tres " + estado.ultimoMovimiento.cartasJugadas[1]+ '</p>\n';
            
        }

        html += '</div>\n';

        html += '<div class="col-md-6 col-md-offset-1 datosPartida">\n';
        html += '<label class="col-md-12 control-labelPerfil">Tus cartas</label>\n';
        for (let k = 0; k < estado.cartasJugador[1].cartas.length; k++) {
            html += '<img src="../images/' + estado.cartasJugador[1].cartas[k] + '.png" >\n';
        }
        
        
        if(authUser == estado.turno){
            html += '<button type="button" class="col-md-3 btn btn-primary actPartBtn">Jugar cartas seleccionadas</button>\n';
            html += '<button type="button" class="col-md-3 btn btn-danger actPartBtn">¡Mentiroso!</button>\n';
        }else{
            html += '<p class="col-md-10">Aun no es tu turno</p>\n';
        }
       

        html += '</div>\n';
    }
    html += '</div>\n';
    html += '</div>\n';

    return html;
}

function updateTab(id, estado) {
    if (estado.jugadoresEnPartida.length < 4) {
        $("#fullPlayersTxt" + id).text("La partida aun no tiene cuatro jugadores");
    } else {
        $("#fullPlayersTxt" + id).text("La partida tiene cuatro jugadores");
    }
    $(".jugadoresPartida" + id).remove();
    for (let i = 0; i < estado.jugadoresEnPartida.length; ++i) {
        let html = '<tr class="jugadoresPartida' + id + '">\n';
        html += '<td>' + estado.jugadoresEnPartida[i].nomJugador + '</td>\n';
        html += '<td>' + estado.cartasJugador[i] + '</td>\n';
        html += '</tr>\n';
        $("#tablaJugadoresPartida" + id).append(html);
    }
}

$(() => {

    let actBtns = [];

    $("#tabContent").on("click", ".actPartBtn", (event) => {
        let target = event.currentTarget;
        let id = $(target).prop("id");
        $.ajax({
            type: "GET",
            url: "/partidas/estadoPartida",
            contentType: "application/json",
            beforeSend: function(req) {
                if (base64user) {
                    req.setRequestHeader("Authorization", "Basic " + base64user);
                }
            },
            data: { idPartida: id },
            success: (data, textStatus, jqXHR) => {
                updateTab(data.id, JSON.parse(data.estado));
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
        })
    })

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
                let html = createTab(idPartida, data.nomPartida, data.estado);
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
                                let estado = JSON.parse(d.estado);
                                let html = createTab(d.id, d.nombre, estado);
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
                let html = createTab(data.idPartida, nombre, data.estado);
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