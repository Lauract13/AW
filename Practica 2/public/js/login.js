"use strict";

let authUser = null;
let authPassword = null;
let authId = null;
let base64user = null;

let  selectedCards= [];

function createTab(id, nombre, estado) {
    console.log(estado);
    let currentUserPos = null;
    let html = '<div id="' + id + '" class="tab-pane fade gameTab">\n';
    html += '<div class="row infoPart">\n';
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
    html += '<div class="col-md-3 col-md-offset-2 infoJugadores">\n';
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
        if (estado.cartasJugador[i].idJugador === authId) currentUserPos = i;
    }
    html += '</tbody>\n';
    html += '</table>\n';
    html += '</div>\n';

    if (estado.jugadoresEnPartida.length === 4) {
        html += '<div class="col-md-6 col-md-offset-1 datosPartida">\n';
        html += '<label class="col-md-12 control-labelPerfil">Cartas en la mesa</label>\n';

        for (let j = 0; j < estado.cartasEnMesa.length; j++) {
            html += '<p class="col-md-12">' + estado.cartasEnMesa[j] + '</p>\n';
        }

        if (estado.ultimoMovimiento.cartasJugadas.length == 1) {
            html += '<p class="col-md-10">' + estado.ultimoMovimiento.idJugador + " dice que ha colocado un " + estado.ultimoMovimiento.cartasJugadas[1] + '</p>\n';

        } else if (estado.ultimoMovimiento.cartasJugadas.length == 2) {
            html += '<p class="col-md-10">' + estado.ultimoMovimiento.idJugador + " dice que ha colocado dos " + estado.ultimoMovimiento.cartasJugadas[1] + '</p>\n';

        } else if (estado.ultimoMovimiento.cartasJugadas.length == 3) {
            html += '<p class="col-md-10">' + estado.ultimoMovimiento.idJugador + " dice que ha colocado tres " + estado.ultimoMovimiento.cartasJugadas[1] + '</p>\n';

        }

        html += '</div>\n';
        html += '<div class="col-md-5"></div>\n';

        html += '<div id="cartasDiv" class="col-md-offset-1 col-md-10 col-md-offset-1 datosPartida">\n';
        html += '<label class="col-md-11 control-labelPerfil">Tus cartas</label>\n';
        let offset = 0;
        for (let k = 0; k < estado.cartasJugador[currentUserPos].cartas.length; k++) {
            html += '<div class="col-md-3 cardRow">'
            html += '<img class="cartasJugador" id="' + k + ' ' + id + ' ' + currentUserPos + '" src="../images/' + estado.cartasJugador[currentUserPos].cartas[k] + '.png" >\n';
            html += '</div>';
        }


<<<<<<< HEAD
        if (currentUserPos == estado.turno) {
            html += '<div class="col-md-offset-3 col-md-3 cardRow"><button type="button" class="btn btn-primary actPartBtn">Jugar cartas seleccionadas</button></div>\n';
            html += '<div class="col-md-5 col-md-offset-1 cardRow"><button type="button" class="btn btn-danger actPartBtn">¡Mentiroso!</button></div>\n';
=======
        if (authUser == estado.turno) {
            html += '<div class="col-md-offset-3 col-md-3 cardRow"><button type="button" id="jugarBtn" class="btn btn-primary actPartBtn">Jugar cartas seleccionadas</button></div>\n';
            html += '<div class="col-md-5 col-md-offset-1 cardRow"><button type="button" id="mentirosoBtn" class="btn btn-danger actPartBtn">¡Mentiroso!</button></div>\n';
>>>>>>> 496e151a91255d123c38bf4c68e8e904b7de2714
        } else {
            html += '<div class="col-md-12 cardRow"><p class="text-center">Aun no es tu turno</p></div>\n';
        }


        html += '</div>\n';
    }
    html += '</div>\n';
    html += '</div>\n';

    console.log(html);
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

    $("#tabContent").on("click", ".cartasJugador", (event) => {
        let target = event.currentTarget;
        console.log(target);
        let ids = $(target).prop("id").split(" ");
        let cardId = ids[0];
        let gameId = ids[1];
        let userPos = ids[2];
        let selected = $(target).hasClass("cardSelected");
        $.ajax({
            type: "GET",
            url: "/partidas/estadoPartida",
            contentType: "application/json",
            beforeSend: function(req) {
                if (base64user) {
                    req.setRequestHeader("Authorization", "Basic " + base64user);
                }
            },
            data: { idPartida: gameId },
            success: (data, textStatus, jqXHR) => {
                let estado = JSON.parse(data.estado);
                if (!selected) {
                    selectedCards.push(estado.cartasJugador[userPos].cartas[cardId]);
                    $(target).addClass("cardSelected");
                } else {
                    let ind = selectedCards.indexOf(estado.cartasJugador[userPos].cartas[cardId]);
                    selectedCards.splice(ind, 1);
                    $(target).removeClass("cardSelected");
                }

                
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
    })
   
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
    $("#jugarBtn").on("click", () =>{
        var encontrado = false;
        var cont = 0;
        //cambiar turno, cambiar mis cartas, cambiar cartas en la mesa, cambiar ultimo movimiento
        if(estado.turno == 4){
            estado.turno == 1;
        }else{
            estado.turno = estado.turno + 1;
        }
        estado.ultimoMovimiento.idJugador = authId;
        estado.ultimoMovimiento.cartas = selectedCards;
        estado.cartasEnMesa = selectedCards;

        while(!encontrado){
            if(estado.cartasJugador[cont].idJugador == authId){
                //splice
                estado.cartasJugador[cont].cartas = estado.cartasJugador[cont].cartas - selectedCards;
                encontrado = true;
            }else{
                cont++;
            }
        }
        
         $.ajax({
             type: "POST",
             url: "/partidas/actualizarPartida",
             contentType:"application/json",
             data:JSON.stringify({estado:estado}),
             success: (data, textStatus, jqHRK)=>{
                $("#errorTxt").text("Bien jugado");
             },
             error:(jqXHR, textStatus, errorThrown)=>{
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