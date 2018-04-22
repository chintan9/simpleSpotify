$(function () {

    var loop = 200
    var template = function (data) {
        return `
    <div class="main-wrapper">
      <div class="now-playing__img">
        <img src="${data.body.item.album.images["0"].url}">
      </div>
      <div class="now-playing__side">
        <div class="now-playing__name">${data.body.item.name}</div>
        <div class="now-playing__artist">${data.body.item.artists[0].name}</div>
        <div class="now-playing__status">${data.body.is_playing ? 'Playing' : 'Paused'}</div>
        <div class="progress">
          <div class="progress__bar" style="width:${data.body.progress_ms * 100 / data.body.item.duration_ms}%"></div>
        </div>
      </div>
    </div>
    <div class="background" style="background-image:url(${data.body.item.album.images[0].url})"></div>
  `;
    };

    var mainContainer = document.getElementById('js-main-container'),
        loginContainer = document.getElementById('js-login-container'),
        loginButton = document.getElementById('js-btn-login'),
        background = document.getElementById('js-background'),
        info = document.getElementById('info');

    $.ajax({
        url: 'getMe',
        data: {
            format: 'json'
        },
        error: function () {
            $('#info').html('<p>An error has occurred</p>');
        },
        dataType: 'json',
        success: function (data) {
            info.innerHTML = `
        <div class="info-box">
        <div class="info-line"><a href= ${data.body.external_urls.spotify}> ${data.body.display_name} </a> </div>
      </div>`
        },
        type: 'GET'
    });

    (function runForever() {
        $.ajax({
            url: 'playing',
            data: {
                format: 'json'
            },
            error: function () {
                $('#info').html('<p>An error has occurred</p>');
            },
            dataType: 'json',
            success: function (data) {
                console.log(data)
                loop = data.statusCode
                if (loop === 200) {
                    mainContainer.innerHTML = template(data);
                    loginContainer.style.display = 'none';
                    mainContainer.style.display = 'block';
                    document.title = data.body.item.name
                }
            },
            type: 'GET'
        });

        setTimeout(runForever, 1000)
    })()

});