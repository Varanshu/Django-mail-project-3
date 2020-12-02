document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  load_mailbox('inbox');
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = save_mail;

  // By default, load the inbox
});

function compose_email(recipient,sub) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-emails').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = ``;
  document.querySelector('#compose-body').value = '';
  document.querySelector('#compose-recipients').disabled = false;
  document.querySelector('#compose-subject').disabled = false;

  if(recipient && sub){
      document.querySelector('#compose-recipients').value = `${recipient}`;
      document.querySelector('#compose-recipients').disabled = true;
      document.querySelector('#compose-subject').value = `Re: ${sub}`;
      document.querySelector('#compose-subject').disabled = true;

  }
}




function save_mail() {

  const recipients = document.querySelector('#compose-recipients').value;
  const body = document.querySelector('#compose-body').value;
  const sub = document.querySelector('#compose-subject').value;

  fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: sub,
        body: body,
        read: false,
        archived: false
      })
    })
    .then(response => response.json())
    .then(result => {
      if ("message" in result) {
        fetch(`/emails/${result.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: false
          })
        })
        console.log(emails["message"]);
        alert(emails["message"]);
      } else {
        console.log(emails["error"]);
        alert(emails["error"]);
      }
    });

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-emails').style.display = 'none';

  const heading = document.createElement("div");
  const table = document.createElement("table");
  table.setAttribute("class", "table table-striped");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody")
  const tr_heading = document.createElement("tr");
  // Show the mailbox name

  heading.innerHTML = `<h3 id="topic">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  document.querySelector("#emails-view").innerHTML = heading.innerHTML;
  document.querySelector("#emails-view").append(table);

  document.querySelector("table").append(thead);

  if (mailbox == "sent") {
    tr_heading.innerHTML = `<th scope="col">Recipient</th><th scope="col">Subject</th><th scope="col">Date and Time</th>`
  } else {
    tr_heading.innerHTML = `<th scope="col">Sender</th><th scope="col">Subject</th><th scope="col">Date and Time</th><th scope="col">Archived</th>`
  }

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {

      document.querySelector("thead").append(tr_heading);
      document.querySelector("table").append(tbody);
      console.log(emails);
      emails.forEach(i => {
        // show_emails(i, mailbox);
        const tr = document.createElement("tr");
        if (mailbox == "sent") {
          tr.innerHTML = `<td>${i.recipients}</td><td>${i.subject}</td><td>${i.timestamp}</td>`;
          document.querySelector("tbody").append(tr);
        } else {

          console.log(mailbox);
          if (i.archived) {
            var archi = "YES"
          } else {
            var archi = "NO"
          }
          tr.innerHTML = `<td id="entry" onclick="load_email(${i.id},${mailbox})">${i.sender}</td><td id="entry">${i.subject}</td><td id="entry">${i.timestamp}</td><td  onclick="archive_mail(${i.id},${i.archived})">${archi}</td>`;
          //<td id="archived" onclick="archive_mail(${i.id},${i.archived})">Yes</td>
          document.querySelector("tbody").append(tr);
          const row = document.querySelector("tr");
          if (i.read == false) {
            tr.classList.add("bold");
          } else {
            tr.classList.add("not-bold");
          }
        }
      });
    });

}

function archive_mail(id, bool) {
  console.log(id);
  if (bool) {
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })
  } else {
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
  }
  document.location.reload();
}

function load_email(email_id, mailbox) {
  console.log(email_id);
  var recipient = "";
  var sub = "";
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-emails').style.display = 'block';

  fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
      document.querySelector("#sender").innerHTML = email["sender"];
      document.querySelector("#recipient").innerHTML = email["recipients"];
      document.querySelector("#subject").innerHTML = email["subject"];
      document.querySelector("#timestamp").innerHTML = email["timestamp"];
      document.querySelector("#body").value = email["body"];
      document.querySelector("#body").disabled = true;
      recipient = email["sender"];
      sub = email["subject"];
    });

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  document.querySelector('#replyBtn').addEventListener('click', () => compose_email(recipient,sub));
}
