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
                data[i].merge = ((data[i].merge * data[i].count) + e.data.merge) / (data[i].count + 1);
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
                ykeys: ['merge', 'bubble'],
                labels: ['Merge Sort', 'Bubble Sort'],
                hideHover: 'auto',
                hoverCallback: (index, options, content, row) => {
                    return `
                    <div>The number of trials is ${row.count}</div>
                    <div>The number of elements is ${row.num}</div>
                    <div style="color: rgb(11, 98, 164);">Merge Sort takes ${row.merge.toFixed(3)} ms</div>
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
        if (num > 10000) {
            return alert('Ceban ae gan');
        }
        showLoading();
        
        
        var arrOri = Array.from({length: num}, () => getRandInteger(Number.MIN_VALUE, Number.MAX_VALUE));
        var arrMerge = arrOri.slice();
        var arrBubble = arrOri.slice();
        worker.postMessage({num: num, arrMerge: arrMerge, arrBubble: arrBubble});
    });
   
    $('#btn-bubble').click(() => {
        showLoading();
        $.get('code/bubble_sort.py', (data) => {
            Swal.fire({
                title: 'Bubble Sort Algorithm',
                html: $('<pre/>').css('text-align', 'left').html(data),
                showConfirmButton: false
            });
        });
    });
   
    $('#btn-merge').click(() => {
        showLoading();
        $.get('code/merge_sort.py', (data) => {
            Swal.fire({
                title: 'Merge Sort Algorithm',
                width: '600px',
                html: $('<pre/>').css('text-align', 'left').html(data),
                showConfirmButton: false
            });
        });
    });
});