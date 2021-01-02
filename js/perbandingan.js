$(function() {
    function getRandInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function showLoading() {
        Swal.fire({
            title: 'Please Wait',
            allowEscapeKey: false,
            allowOutsideClick: false,
            showConfirmButton: false,
            onOpen: () => {
                Swal.showLoading();
            }
        });
    }

    if (typeof(Worker) === 'undefined') {
        alert('Your browser doesn\'t have support for Web Worker, this site can\'t work as it should!');
    }
    
    $(".loader").fadeOut(1000, () => {
        $("#content").fadeIn(1000);
    });
    
    var data = [];
    var compareBar;
    
    var worker = new Worker('js/worker.js');
    
    worker.addEventListener('message', (e) => {
        var duplicate = false;
        for (var i = 0; i < data.length; i++) {
            if (data[i].num === e.data.num) {
                data[i].unshuffle = ((data[i].unshuffle * data[i].count) + e.data.unshuffle) / (data[i].count + 1);
                data[i].bubble = ((data[i].bubble * data[i].count) + e.data.bubble) / (data[i].count + 1);
                data[i].count++;
                duplicate = true;
                break;
            }
        }
        
        if (!duplicate) {
            data.push(e.data);
            data[data.length - 1].count = 1;
        }
        
        if (!compareBar) {
           compareBar = Morris.Bar({
                element: 'bar-chart',
                data: data,
                xkey: 'num',
                ykeys: ['unshuffle', 'bubble'],
                labels: ['Unshuffle Sort', 'Bubble Sort'],
                hideHover: 'auto',
                hoverCallback: (index, options, content, row) => {
                    return `
                    <div>The number of trials is ${row.count}</div>
                    <div>The number of elements is ${row.num}</div>
                    <div style="color: rgb(11, 98, 164);">Unshuffle Sort takes ${row.unshuffle.toFixed(3)} ms</div>
                    <div style="color: rgb(122, 146, 163);">Bubble Sort takes ${row.bubble.toFixed(3)} ms</div>
                    `;
                }
            });
            
            compareBar.options.labels.forEach((label, i) => {
                var legendItem = $('<span class="legend-item"></span>').text(label).prepend('<span class="legend-color">&nbsp;</span>');
                legendItem.find('span').css('backgroundColor', compareBar.options.barColors[i]);
                $('#bar-legend').append(legendItem);
           });
       } else {
           data.sort((a, b) => a.num - b.num);
           compareBar.setData(data);
       }
       Swal.close();
    }, false);

    $('#btn-compare').click(() => {
        var num = parseInt($('#number').val());
        if (num <= 0) {
            return alert('Sehat gan?');
        }
        if (num > 100000) {
            return alert('Ceban ae gan');
        }
        showLoading();
        
        
        var arrOri = Array.from({length: num}, () => getRandInteger(Number.MIN_VALUE, Number.MAX_VALUE));
        var arrUnshuffle = arrOri.slice();
        var arrBubble = arrOri.slice();
        worker.postMessage({num: num, arrUnshuffle: arrUnshuffle, arrBubble: arrBubble});
    });
   
    $('#btn-bubble').click(() => {
        showLoading();
        $.get('code/bubble_sort.js', (data) => {
            Swal.fire({
                title: 'Algoritma Bubble Sort ',
                html: $('<pre/>').css('text-align', 'left').html(data),
                showConfirmButton: false
            });
        });
    });
   
    $('#btn-unshuffle').click(() => {
        showLoading();
        $.get('code/unshuffle_sort.js', (data) => {
            Swal.fire({
                title: 'Algoritma Unshuffle Sort ',
                width: '600px',
                html: $('<pre/>').css('text-align', 'left').html(data),
                showConfirmButton: false
            });
        });
    });
});