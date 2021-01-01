importScripts('queue.js');

function merge(arr1, arr2) {
    var arr3 = [];
    var i = 0;
    var j = 0;
    while (i < arr1.length & j < arr2.length) {
        arr3.push(arr1[i] <= arr2[j] ? arr1[i++] : arr2[j++]);
    }
    
    while (i < arr1.length) {
        arr3.push(arr1[i++]);
    }
    
    while (j < arr2.length) {
        arr3.push(arr2[j++]);
    }
    
    return arr3;
}

function mergeSort(arr) {
    var queue = new Queue();
    for (var i = 0; i < arr.length; i++) {
        queue.push([arr[i]]);
    }
    while (queue.size() > 1) {
        var temp = new Queue();
        while (queue.size() > 1) {
            temp.push(merge(queue.pop(), queue.pop()));
        }
        
        if (queue.size() == 1) {
            temp.push(queue.pop());
        }
        
        queue = temp;
    }
    return queue.pop();
}

function bubbleSort(arr) {
    for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}

function calculateMerge(arr) {
    var start = performance.now();
    arr = mergeSort(arr);
    var end = performance.now();
    return end - start;
}

function calculateBubble(arr) {
    var start = performance.now();
    arr = bubbleSort(arr);
    var end = performance.now();
    return end - start;
}

self.addEventListener('message', (e) => {
    data = {
        num: e.data.num,
        merge: calculateMerge(e.data.arrMerge),
        bubble: calculateBubble(e.data.arrBubble)
    }
    self.postMessage(data);
}, false);