$(document).ready(function() {
  $('.delete-article').on('click', function(e) {
    $target = $(e.target);
    const id = $target.attr('data-id');
    alert("From JS");
    $.ajax({
      type: 'DELETE',
      url: '/articles/' + id,
      success: function(response) {
        alert("Deleting the Article");
        window.location.href = '/';
      },
      error: function(err) {
        console.log("Something Went Wrong" + err);
      }
    });
  });
});
