window.onload = function() {

    let TEST_CONTENT = document.getElementById('test-content')
    let userContent = document.getElementById('user-content')
    let currentPostion = 0
    let match = true
    const regex = /^[a-zA-Z.,;:'"!?(){}[\]\\\s/-]$/

    // for (let i = 0; i < TEST_CONTENT.innerHTML.length; i++) {
    //     userContent.innerHTML += `<span style="color: blue">${TEST_CONTENT.innerHTML.charAt(i)}</span>`
    // }

    userContent.innerHTML += `<span style="color: blue">${TEST_CONTENT.innerHTML.charAt(0)}</span>`
    userContent.innerHTML += `<span style="color: blue">${TEST_CONTENT.innerHTML.charAt(1)}</span>`
    userContent.innerHTML += `<span style="color: blue">${TEST_CONTENT.innerHTML.charAt(2)}</span>`




    // document.addEventListener('keydown', (e) => {
    //     console.log('Key pressed:', e.key);
    //     console.log('Char code:', e.key.charAt(0))

    //     if (regex.test(e.key)) {
    //         if (e.key === TEST_CONTENT.innerHTML.charAt(currentPostion)) {
    //             match = true
    //             userContent.innerHTML += `<span style="color: green">${e.key}</span>`

    //         } else {
    //             if (e.key.charAt(0) == ' ') {
    //                 while (TEST_CONTENT.innerHTML.charAt(currentPostion) !== ' ') {
    //                     userContent.innerHTML += `<span style="color: red">${TEST_CONTENT.innerHTML.charAt(currentPostion)}</span>`
    //                     currentPostion++
    //                 }
    //             }

    //             userContent.innerHTML += `<span style="color: red">${e.key}</span>`
    //             match = false
    //         }

    //         currentPostion++

    //     } else if (e.key.charAt(0) == 'B') {
    //         userContent.lastChild.remove()
    //         currentPostion--
    //     }
    // })
}