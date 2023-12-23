window.onload = function() {

    let TEST_CONTENT = document.getElementById('test-content')
    let userContent = document.getElementById('user-content')
    let currentPosition = 0
    let testPosition = 0
    const regex = /^[a-zA-Z.,;:'"!?(){}[\]\\\s/-]$/

    for (let i = 0; i < TEST_CONTENT.innerHTML.length; i++) {
        let c = document.createElement('span')
        c.innerHTML = TEST_CONTENT.innerHTML.charAt(i)
        c.style.color = 'purple'
        userContent.appendChild(c)
    }

    document.addEventListener('keydown', (e) => {

        if (regex.test(e.key)) {
            if (e.key === TEST_CONTENT.innerHTML.charAt(testPosition)) {
                userContent.children[currentPosition].style.color = 'green'
                testPosition++
                currentPosition++

            } else {
                if (e.key.charAt(0) == ' ') {
                    while (userContent.children[currentPosition].innerHTML !== ' ') {
                        testPosition++
                        currentPosition++
                    }
                testPosition++
                currentPosition++

                } else if (TEST_CONTENT.innerHTML.charAt(testPosition) == ' ') {
                    let c = document.createElement('span')
                    c.innerHTML = e.key
                    c.style.color = 'red'
                    c.setAttribute('class', 'excess')
                    userContent.insertBefore(c, userContent.children[currentPosition])
                    currentPosition++

                } else {
                    userContent.children[currentPosition].style.color = 'red'
                    currentPosition++
                    testPosition++
                }
            }

        } else if (e.key.charAt(0) == 'B') {
            if (currentPosition == 0) return


            if (userContent.children[currentPosition - 1].innerHTML !== ' ' || userContent.children[currentPosition - 1].style.color !== 'purple') {
                if (userContent.children[currentPosition - 1].hasAttribute('class')) {
                    userContent.children[currentPosition - 1].remove()
                    currentPosition--

                } else {
                    userContent.children[currentPosition - 1].style.color =  'purple'
                    currentPosition--
                    testPosition--
                }
            } else {
                while (userContent.children[currentPosition - 1].style.color === 'purple') {
                    currentPosition--
                    testPosition--
                }
            }
        }

        console.log('Current: ', TEST_CONTENT.innerHTML.charAt(testPosition));
    })
}