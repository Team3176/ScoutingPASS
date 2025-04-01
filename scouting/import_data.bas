Option Explicit

' Custom JSON parser functions
Private Function ParseJSON(ByVal jsonString As String) As Dictionary
    Dim dict As Dictionary
    Set dict = New Dictionary
    
    ' Remove the curly braces from start and end
    jsonString = Trim(jsonString)
    jsonString = Mid(jsonString, 2, Len(jsonString) - 2)
    
    Dim parts() As String
    parts = Split(jsonString, ",")
    
    Dim i As Long
    Dim key As String
    Dim value As String
    Dim pos As Long
    
    For i = 0 To UBound(parts)
        ' Find the position of the first colon
        pos = InStr(parts(i), ":")
        If pos > 0 Then
            ' Extract key (remove quotes)
            key = Trim(Left(parts(i), pos - 1))
            key = Replace(key, """", "")
            
            ' Extract value
            value = Trim(Mid(parts(i), pos + 1))
            
            ' Handle nested objects (like starting_pos)
            If Left(value, 1) = "{" Then
                If key = "starting_pos" Then
                    Dim posDict As Dictionary
                    Set posDict = ParseStartingPos(value)
                    dict.Add key, posDict
                End If
            Else
                ' Remove quotes from string values
                value = Replace(value, """", "")
                dict.Add key, value
            End If
        End If
    Next i
    
    Set ParseJSON = dict
End Function

Private Function ParseStartingPos(ByVal jsonString As String) As Dictionary
    Dim dict As Dictionary
    Set dict = New Dictionary
    
    ' Remove the curly braces
    jsonString = Mid(jsonString, 2, Len(jsonString) - 2)
    
    Dim parts() As String
    parts = Split(jsonString, ",")
    
    Dim i As Long
    Dim key As String
    Dim value As String
    Dim pos As Long
    
    For i = 0 To UBound(parts)
        pos = InStr(parts(i), ":")
        If pos > 0 Then
            key = Trim(Left(parts(i), pos - 1))
            key = Replace(key, """", "")
            value = Trim(Mid(parts(i), pos + 1))
            dict.Add key, CDbl(value)
        End If
    Next i
    
    Set ParseStartingPos = dict
End Function

' This macro reads JSON data from a text file and imports it into the active worksheet
Sub ImportScoutingData()
    On Error GoTo ErrorHandler
    
    Dim FSO As Object
    Dim TextFile As Object
    Dim TextLine As String
    Dim ws As Worksheet
    Dim row As Long
    Dim dict As Dictionary
    Dim filePath As String
    
    ' Let user select the data file
    With Application.FileDialog(msoFileDialogFilePicker)
        .Title = "Select the scouting data text file"
        .Filters.Clear
        .Filters.Add "Text Files", "*.txt"
        .InitialFileName = ThisWorkbook.Path
        
        If .Show = -1 Then
            filePath = .SelectedItems(1)
        Else
            MsgBox "No file selected. Import cancelled.", vbInformation
            Exit Sub
        End If
    End With
    
    ' Check if file exists
    Set FSO = CreateObject("Scripting.FileSystemObject")
    If Not FSO.FileExists(filePath) Then
        MsgBox "Error: Cannot find the data file at: " & filePath, vbCritical
        Exit Sub
    End If
    
    ' Set up the worksheet
    Set ws = ActiveSheet
    
    ' Ask user if they want to clear existing data
    If MsgBox("Do you want to clear existing data before importing?", vbYesNo + vbQuestion) = vbYes Then
        ws.UsedRange.Clear
    End If
    
    ' Add headers
    ws.Cells(1, 1).Value = "Scouter Name"
    ws.Cells(1, 2).Value = "Match Level"
    ws.Cells(1, 3).Value = "Match Number"
    ws.Cells(1, 4).Value = "Team Number"
    ws.Cells(1, 5).Value = "Robot Position"
    ws.Cells(1, 6).Value = "Starting X"
    ws.Cells(1, 7).Value = "Starting Y"
    ws.Cells(1, 8).Value = "L1 Auton"
    ws.Cells(1, 9).Value = "L2 Auton"
    ws.Cells(1, 10).Value = "L3 Auton"
    ws.Cells(1, 11).Value = "L4 Auton"
    ws.Cells(1, 12).Value = "Algae Removal Auton"
    ws.Cells(1, 13).Value = "Processor Auton"
    ws.Cells(1, 14).Value = "Net Auton"
    ws.Cells(1, 15).Value = "Start Line"
    ws.Cells(1, 16).Value = "L1 Teleop"
    ws.Cells(1, 17).Value = "L2 Teleop"
    ws.Cells(1, 18).Value = "L3 Teleop"
    ws.Cells(1, 19).Value = "L4 Teleop"
    ws.Cells(1, 20).Value = "Algae Removal Teleop"
    ws.Cells(1, 21).Value = "Processor Teleop"
    ws.Cells(1, 22).Value = "Net Teleop"
    ws.Cells(1, 23).Value = "Penalties"
    ws.Cells(1, 24).Value = "Defense"
    ws.Cells(1, 25).Value = "Died"
    ws.Cells(1, 26).Value = "Deep Climb"
    ws.Cells(1, 27).Value = "Shallow Climb"
    ws.Cells(1, 28).Value = "Parked"
    ws.Cells(1, 29).Value = "Comments"
    ws.Cells(1, 30).Value = "Red Score"
    ws.Cells(1, 31).Value = "Blue Score"
    
    ' Format headers
    With ws.Range(ws.Cells(1, 1), ws.Cells(1, 31))
        .Font.Bold = True
        .Interior.Color = RGB(200, 200, 200)
    End With
    
    ' Pre-format columns that contain fractions as text
    With ws.Range("H:N,P:V")  ' Columns for L1-L4, Processor, Net scores in both Auton and Teleop
        .NumberFormat = "@"    ' Set as text format
    End With
    
    ' Open the text file
    Set TextFile = FSO.OpenTextFile(filePath, 1)
    
    ' Start from row 2 (after headers)
    row = 2
    
    Application.ScreenUpdating = False
    
    ' Read each line from the file
    Do While Not TextFile.AtEndOfStream
        TextLine = TextFile.ReadLine
        
        ' Skip empty lines
        If Len(Trim(TextLine)) > 0 Then
            ' Parse JSON data
            On Error Resume Next
            Set dict = ParseJSON(TextLine)
            If Err.Number <> 0 Then
                MsgBox "Error parsing line " & row - 1 & ": " & Err.Description, vbExclamation
                Err.Clear
                GoTo NextLine
            End If
            On Error GoTo ErrorHandler
            
            ' Write data to worksheet
            With ws
                ' Regular fields
                .Cells(row, 1).Value = dict("scouter_name")
                .Cells(row, 2).Value = dict("level")
                .Cells(row, 3).Value = dict("match_num")
                .Cells(row, 4).Value = dict("team_num")
                .Cells(row, 5).Value = dict("robot")
                .Cells(row, 6).Value = dict("starting_pos")("x")
                .Cells(row, 7).Value = dict("starting_pos")("y")
                
                ' Fraction fields - Format as text
                .Cells(row, 8).NumberFormat = "@"
                .Cells(row, 8).Value = "'" & dict("L1_auton")
                .Cells(row, 9).NumberFormat = "@"
                .Cells(row, 9).Value = "'" & dict("L2_auton")
                .Cells(row, 10).NumberFormat = "@"
                .Cells(row, 10).Value = "'" & dict("L3_auton")
                .Cells(row, 11).NumberFormat = "@"
                .Cells(row, 11).Value = "'" & dict("L4_auton")
                .Cells(row, 12).NumberFormat = "@"
                .Cells(row, 12).Value = "'" & dict("algae_removal")
                .Cells(row, 13).NumberFormat = "@"
                .Cells(row, 13).Value = "'" & dict("processor")
                .Cells(row, 14).NumberFormat = "@"
                .Cells(row, 14).Value = "'" & dict("net")
                
                .Cells(row, 15).Value = dict("start_line")
                
                ' Teleop fraction fields - Format as text
                .Cells(row, 16).NumberFormat = "@"
                .Cells(row, 16).Value = "'" & dict("L1_teleop")
                .Cells(row, 17).NumberFormat = "@"
                .Cells(row, 17).Value = "'" & dict("L2_teleop")
                .Cells(row, 18).NumberFormat = "@"
                .Cells(row, 18).Value = "'" & dict("L3_teleop")
                .Cells(row, 19).NumberFormat = "@"
                .Cells(row, 19).Value = "'" & dict("L4_teleop")
                .Cells(row, 20).NumberFormat = "@"
                .Cells(row, 20).Value = "'" & dict("algae_removal_teleop")
                .Cells(row, 21).NumberFormat = "@"
                .Cells(row, 21).Value = "'" & dict("processor_teleop")
                .Cells(row, 22).NumberFormat = "@"
                .Cells(row, 22).Value = "'" & dict("net_teleop")
                
                ' Regular fields
                .Cells(row, 23).Value = dict("penalties")
                .Cells(row, 24).Value = dict("defense")
                .Cells(row, 25).Value = dict("died")
                .Cells(row, 26).Value = dict("deep_climb")
                .Cells(row, 27).Value = dict("shallow_climb")
                .Cells(row, 28).Value = dict("parked")
                .Cells(row, 29).Value = dict("comments")
                .Cells(row, 30).Value = dict("red_scores")
                .Cells(row, 31).Value = dict("blue_scores")
            End With
            
            row = row + 1
        End If
NextLine:
    Loop
    
    ' Close the text file
    TextFile.Close
    
    ' Autofit columns
    ws.UsedRange.Columns.AutoFit
    
    ' Add filters
    ws.Range("A1").CurrentRegion.AutoFilter
    
    ' Format data range with borders
    With ws.Range("A1").CurrentRegion
        .Borders.LineStyle = xlContinuous
        .Borders.Weight = xlThin
    End With
    
    Application.ScreenUpdating = True
    
    MsgBox "Data import complete! " & (row - 2) & " records imported.", vbInformation
    Exit Sub

ErrorHandler:
    Application.ScreenUpdating = True
    MsgBox "An error occurred: " & Err.Description, vbCritical
    If Not TextFile Is Nothing Then TextFile.Close
End Sub

' Add a button to run the import
Sub AddImportButton()
    Dim btn As Button
    Dim ws As Worksheet
    
    Set ws = ActiveSheet
    
    ' Add a button to the sheet
    Set btn = ws.Buttons.Add(10, 10, 120, 30)
    With btn
        .OnAction = "ImportScoutingData"
        .Caption = "Import Scouting Data"
    End With
End Sub 