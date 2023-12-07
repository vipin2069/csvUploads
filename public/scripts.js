$(function () {
  let selectedFilename;
  let dataTableInstance;
  // Fetch and display file list on page load
  fetchFileList();

  // Upload form submission
  $("#uploadForm").on("submit", (event) => {
    event.preventDefault(); // Prevent the default form submission

    const fileInput = $("#fileInput")[0];
    const file = fileInput.files[0];

    if (file) {
      // Check if the file is already in the list
      const isFileAlreadyUploaded = uploadedFiles.some(
        (uploadedFile) =>
          uploadedFile.name === file.name && uploadedFile.size === file.size
      );

      if (!isFileAlreadyUploaded) {
        const formData = new FormData();
        formData.append("csvFile", file);

        // Upload file
        $.ajax({
          url: "http://localhost:3000/upload",
          type: "POST",
          data: formData,
          processData: false,
          contentType: false,
          success: () => {
            // Refresh file list after successful upload
            fetchFileList();
          },
          error: (xhr, status, error) => {
            console.error("File upload failed:", error);
            alert("File upload failed. Please try again.");
          },
        });
      } else {
        alert(
          "File with the same name or size already exists. Upload a different file."
        );
      }
    }
  });

  // Display CSV data when file selected
  $("#fileList").on("click", ".file-item", (event) => {
    selectedFilename = $(event.target).text(); // Store the selected filename
    fetchAndDisplayData(selectedFilename);
  });

  // Fetch and display file list
  function fetchFileList() {
    $("#fileList").empty();
    $.get("http://localhost:3000/files", (files) => {
      uploadedFiles = files;
      files.forEach((file) => {
        $("#fileList").append(`<p class="file-item">${file.name}</p>`);
      });
    });
  }

  // Fetch and display CSV data
  const fetchAndDisplayData = (filename) => {
    $.get(`http://localhost:3000/data/${filename}`, (data) => {
      displayDataTable(data);
    }).fail((xhr, status, error) => {
      console.error("Error fetching CSV data:", error);
      alert("Error fetching CSV data. Please try again.");
    });
  };

  // Display data in a table

  const displayDataTable = (data) => {
    $("#dataTableContainer").empty(); // Clear previous content

    if (data.length > 0) {
      const table = $("<table>").addClass("display").attr("id", "dataTable");

      // Create table header
      const thead = $("<thead>").append(
        $("<tr>").append(
          Object.keys(data[0]).map((header) => $("<th>").text(header))
        )
      );
      table.append(thead);

      // Create table rows
      const tbody = $("<tbody>").append(
        data.map((row) => {
          const tableRow = $("<tr>").append(
            Object.keys(row).map((key) => $("<td>").text(row[key]))
          );
          return tableRow;
        })
      );
      table.append(tbody);

      $("#dataTableContainer").append(table);

      // Initialize DataTable
      dataTableInstance = $("#dataTable").DataTable({
        data: data,
        columns: Object.keys(data[0]).map((header) => ({ data: header })),
      });
    } else {
      $("#dataTableContainer").html("<p>No data available</p>");
    }
  };
});
