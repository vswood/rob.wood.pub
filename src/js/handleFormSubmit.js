async function handleFormSubmit(e) {
  e.preventDefault()
  const formData = new FormData(e.target)
  const data = Object.fromEntries(formData.entries())

  const tests = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,
    phone: /^(\+1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
  }

  if(data.question !=='') {
    formMessage()
  }

  let valid = true

  checkInput('email', data, tests.email)
  checkInput('name', data)
  checkInput('company', data)
  checkInput('phone', data, tests.phone)
  checkInput('subject', data)
  checkInput('message', data)

  const invalid = document.querySelectorAll('.is-invalid')
  valid = invalid.length <= 0
  if(valid) {
    postForm(formData)
  }
}

function formMessage(error = false) {
  document.querySelectorAll('.form-row').forEach(e => e.style.display = 'none')
  document.querySelector('.form-messages').style.display = 'flex'
  if(error === false) {
    document.querySelector('.success.message').style.display = 'block'
  } else {
    const msg = document.querySelector('.error.message')
    msg.style.display = 'block'
    msg.innerHTML = error
  }
  setTimeout(formReset, 8000)
}

function formReset() {
  document.querySelectorAll('.form-row').forEach(e => e.style.display = 'flex')
  document.querySelector('.form-messages').style.display = 'none'
}

function showErrorLabel(el) {
  el.querySelector('.hint').style.display = 'none'
  el.querySelector('.valid').style.display = 'none'
  el.querySelector('.invalid').style.display = 'inline'
}

function showSuccessLabel(el) {
  el.querySelector('.hint').style.display = 'none'
  el.querySelector('.invalid').style.display = 'none'
  el.querySelector('.valid').style.display = 'inline'
}

function checkInput(selector, data, exp = false) {
  const el = document.getElementById(`input-${selector}`)
  const label = el.nextElementSibling
  if(data[selector] === '' || (exp && !exp.test(data[selector]))) {
    el.classList.add('is-invalid')
    showErrorLabel(label)
    return false
  } else {
    el.classList.add('valid')
    showSuccessLabel(label)
    return true
  }
}

async function postForm(data) {
  const apiUrl = '/api/contact'

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: data,
    });

    if (!response.ok) {
      formMessage(`Server error: ${response.status}`)
    }

    const result = await response.json()
    formMessage()
  } catch (e) {
    formMessage(`Server error: ${e.message ?? 'Unknown'}`)
  }
}

export default handleFormSubmit
