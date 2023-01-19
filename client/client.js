const join_block = document.getElementById('join-block')
const chat_block = document.getElementById('chat-block')
const name_box = document.getElementById('name-box')
const room_box = document.getElementById('room-box')
const chat_box = document.getElementById('chat-box')
const msg_box = document.getElementById('msg-box')
const enter_btn = document.getElementById('enter-btn')
const send_btn = document.getElementById('send-btn')
const leave_btn = document.getElementById('leave-btn')

function addMsg(name, msg, bald_name = true) {
  const inf_el = document.createElement('div')
  inf_el.classList.add('inf')
  inf_el.textContent = name
  if (bald_name) inf_el.style.fontWeight = '700'

  const msg_el = document.createElement('div')
  msg_el.classList.add('msg')
  msg_el.textContent = msg

  const msg_block_el = document.createElement('div')
  msg_block_el.classList.add('msg-block')

  msg_block_el.appendChild(inf_el)
  msg_block_el.appendChild(msg_el)
  chat_box.appendChild(msg_block_el)

  chat_box.scrollTop = chat_box.scrollHeight
}
function addNotif(notif) {
  const notif_block_el = document.createElement('div')
  notif_block_el.classList.add('notif-block')
  notif_block_el.textContent = notif

  chat_box.appendChild(notif_block_el)

  chat_box.scrollTop = chat_box.scrollHeight
}

let socket

enter_btn.addEventListener('click', function () {
  console.log('Enter click')
  join_block.style.display = 'none'
  chat_block.style.display = 'block'

  socket = new WebSocket(
    `${'https:' == document.location.protocol ? 'wss' : 'ws'}://${
      window.location.host
    }`
  )

  socket.onopen = function (e) {
    console.log('Connection is oppened', e)
    socket.send(
      JSON.stringify({
        type: 'join',
        name: name_box.value,
        room: room_box.value,
      })
    )
  }
  socket.onclose = function (e) {
    console.log('Connection is closed', e)
  }
  socket.onerror = function (error) {
    console.error('Error', error)
  }
  socket.onmessage = function (e) {
    console.log(e)
    const data = JSON.parse(e.data)
    if (data.type == 'message') addMsg(data.name, data.message)
    else if (data.type == 'notification') addNotif(data.message)
  }
})
send_btn.addEventListener('click', function () {
  console.log('Send click')
  socket.send(
    JSON.stringify({
      type: 'message',
      room: room_box.value,
      message: msg_box.value,
    })
  )
  addMsg('Me', msg_box.value, false)
  msg_box.value = ''
})
leave_btn.addEventListener('click', function () {
  console.log('Leave click')
  socket.close()

  chat_box.innerHTML = ''
  join_block.style.display = 'block'
  chat_block.style.display = 'none'
})
msg_box.addEventListener('keypress', function (e) {
  if (e.key == 'Enter') send_btn.click()
})
