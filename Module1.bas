Attribute VB_Name = "Module1"
Option Explicit

' Windows API declarations for clipboard access
Private Declare PtrSafe Function OpenClipboard Lib "user32" (ByVal hwnd As LongPtr) As Long
Private Declare PtrSafe Function CloseClipboard Lib "user32" () As Long
Private Declare PtrSafe Function GetClipboardData Lib "user32" (ByVal wFormat As Long) As LongPtr
Private Declare PtrSafe Function GlobalLock Lib "kernel32" (ByVal hMem As LongPtr) As LongPtr
Private Declare PtrSafe Function GlobalUnlock Lib "kernel32" (ByVal hMem As LongPtr) As Long
Private Declare PtrSafe Function GlobalSize Lib "kernel32" (ByVal hMem As LongPtr) As Long
Private Declare PtrSafe Function lstrcpy Lib "kernel32" (ByVal lpString1 As String, ByVal lpString2 As LongPtr) As Long

Private Const CF_TEXT = 1

Public Sub InitializeWorksheet()
    ' Create headers if they don't exist
    If ActiveSheet.Range("A1").value = "" Then
        CreateHeaders
    End If
End Sub

Public Sub ScanQRCode()
    Dim ws As Worksheet
    Dim nextRow As Long
    Dim jsonText As String
    Dim dict As Object
    
    ' Set reference to active worksheet
    Set ws = ActiveSheet
    
    ' Initialize headers if needed
    If ws.Range("A1").value = "" Then
        CreateHeaders
    End If
    
    ' Find the next empty row
    nextRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
    
    ' Get QR code data from clipboard
    jsonText = GetClipboardText()
    
    ' Check if we have data
    If Len(jsonText) = 0 Then
        MsgBox "No data found in clipboard. Please scan a QR code first.", vbExclamation
        Exit Sub
    End If
    
    ' Create Dictionary object
    Set dict = CreateObject("Scripting.Dictionary")
    
    ' Parse the JSON string manually
    ParseJsonToDict jsonText, dict
    
    On Error GoTo ErrorHandler
    
    ' Place data in cells
    With ws
        .Cells(nextRow, 1) = GetDictValue(dict, "s")  ' Scouter Initials
        .Cells(nextRow, 2) = GetDictValue(dict, "e")  ' Event
        .Cells(nextRow, 3) = GetDictValue(dict, "l")  ' Match Level
        .Cells(nextRow, 4) = GetDictValue(dict, "m")  ' Match Number
        .Cells(nextRow, 5) = GetDictValue(dict, "t")  ' Team Number
        .Cells(nextRow, 6) = GetDictValue(dict, "r")  ' Robot Position
        .Cells(nextRow, 7) = GetDictValue(dict, "sp") ' Clicked Points
        
        ' Autonomous
        .Cells(nextRow, 8) = GetDictValue(dict, "ac1")  ' Auton Coral L1
        .Cells(nextRow, 9) = GetDictValue(dict, "ac2")  ' Auton Coral L2
        .Cells(nextRow, 10) = GetDictValue(dict, "ac3") ' Auton Coral L3
        .Cells(nextRow, 11) = GetDictValue(dict, "ac4") ' Auton Coral L4
        .Cells(nextRow, 12) = GetDictValue(dict, "aps") ' Auton Processor Score
        .Cells(nextRow, 13) = GetDictValue(dict, "ans") ' Auton Net Score
        .Cells(nextRow, 14) = GetDictValue(dict, "al")  ' Mobility
        .Cells(nextRow, 15) = GetDictValue(dict, "acl") ' Crossed Line
        .Cells(nextRow, 16) = GetDictValue(dict, "asl") ' Coral Scored Location
        .Cells(nextRow, 17) = GetDictValue(dict, "asp") ' Auton Scoring Positions
        
        ' Teleop
        .Cells(nextRow, 18) = GetDictValue(dict, "tc1") ' Teleop Coral L1
        .Cells(nextRow, 19) = GetDictValue(dict, "tc2") ' Teleop Coral L2
        .Cells(nextRow, 20) = GetDictValue(dict, "tc3") ' Teleop Coral L3
        .Cells(nextRow, 21) = GetDictValue(dict, "tc4") ' Teleop Coral L4
        .Cells(nextRow, 22) = GetDictValue(dict, "tps") ' Teleop Processor Score
        .Cells(nextRow, 23) = GetDictValue(dict, "tns") ' Teleop Net Score
        
        ' Endgame
        .Cells(nextRow, 24) = GetDictValue(dict, "os") ' On Stage
        .Cells(nextRow, 25) = GetDictValue(dict, "sl") ' Spotlit
        .Cells(nextRow, 26) = GetDictValue(dict, "h")  ' Harmony
        .Cells(nextRow, 27) = GetDictValue(dict, "tr") ' Trap
        .Cells(nextRow, 28) = GetDictValue(dict, "p")  ' Parked
        .Cells(nextRow, 29) = GetDictValue(dict, "ds") ' Driver Skill
        .Cells(nextRow, 30) = GetDictValue(dict, "dr") ' Defense Rating
        .Cells(nextRow, 31) = GetDictValue(dict, "sr") ' Speed Rating
        .Cells(nextRow, 32) = GetDictValue(dict, "co") ' Comments
    End With
    
    ' Confirm data was added
    MsgBox "Data added to row " & nextRow, vbInformation
    Exit Sub

ErrorHandler:
    MsgBox "Error processing QR code data: " & Err.Description, vbCritical
End Sub

Private Function GetClipboardText() As String
    Dim hClipMemory As LongPtr
    Dim lpClipMemory As LongPtr
    Dim MyString As String
    Dim RetVal As Long
    
    ' Open clipboard
    If OpenClipboard(0&) = 0 Then
        GetClipboardText = ""
        Exit Function
    End If
    
    ' Get handle of clipboard contents
    hClipMemory = GetClipboardData(CF_TEXT)
    If hClipMemory = 0 Then
        CloseClipboard
        GetClipboardText = ""
        Exit Function
    End If
    
    ' Get pointer to clipboard contents
    lpClipMemory = GlobalLock(hClipMemory)
    If lpClipMemory = 0 Then
        CloseClipboard
        GetClipboardText = ""
        Exit Function
    End If
    
    ' Get size of clipboard contents
    MyString = Space$(GlobalSize(hClipMemory))
    
    ' Copy clipboard contents to string
    RetVal = lstrcpy(MyString, lpClipMemory)
    
    ' Clean up
    GlobalUnlock hClipMemory
    CloseClipboard
    
    ' Return clipboard contents
    GetClipboardText = Left$(MyString, InStr(1, MyString, Chr$(0)) - 1)
End Function

Private Function GetDictValue(dict As Object, key As String) As Variant
    If dict.Exists(key) Then
        GetDictValue = dict(key)
    Else
        GetDictValue = ""
    End If
End Function

Private Sub ParseJsonToDict(jsonStr As String, dict As Object)
    Dim cleanStr As String
    Dim pairs() As String
    Dim pair() As String
    Dim i As Long
    
    ' Remove the outer brackets and spaces
    cleanStr = Trim(jsonStr)
    cleanStr = Mid(cleanStr, 2, Len(cleanStr) - 2)
    
    ' Split into key-value pairs
    pairs = Split(cleanStr, ",")
    
    For i = 0 To UBound(pairs)
        ' Clean up the pair
        pairs(i) = Trim(pairs(i))
        ' Split into key and value
        pair = Split(pairs(i), ":")
        
        If UBound(pair) = 1 Then
            ' Clean up key and value
            Dim key As String
            Dim value As String
            
            key = Trim(pair(0))
            value = Trim(pair(1))
            
            ' Remove quotes from key
            key = Replace(key, """", "")
            
            ' Remove quotes from value if it's a string
            If Left(value, 1) = """" And Right(value, 1) = """" Then
                value = Mid(value, 2, Len(value) - 2)
            End If
            
            ' Add to dictionary
            dict(key) = value
        End If
    Next i
End Sub

Private Sub CreateHeaders()
    Dim ws As Worksheet
    Set ws = ActiveSheet
    
    With ws
        .Cells(1, 1) = "Scouter Initials"
        .Cells(1, 2) = "Event"
        .Cells(1, 3) = "Match Level"
        .Cells(1, 4) = "Match Number"
        .Cells(1, 5) = "Team Number"
        .Cells(1, 6) = "Robot Position"
        .Cells(1, 7) = "Clicked Points"
        
        ' Autonomous Headers
        .Cells(1, 8) = "Auton Coral L1"
        .Cells(1, 9) = "Auton Coral L2"
        .Cells(1, 10) = "Auton Coral L3"
        .Cells(1, 11) = "Auton Coral L4"
        .Cells(1, 12) = "Auton Processor Score"
        .Cells(1, 13) = "Auton Net Score"
        .Cells(1, 14) = "Mobility"
        .Cells(1, 15) = "Crossed Line"
        .Cells(1, 16) = "Coral Scored Location"
        .Cells(1, 17) = "Auton Scoring Positions"
        
        ' Teleop Headers
        .Cells(1, 18) = "Teleop Coral L1"
        .Cells(1, 19) = "Teleop Coral L2"
        .Cells(1, 20) = "Teleop Coral L3"
        .Cells(1, 21) = "Teleop Coral L4"
        .Cells(1, 22) = "Teleop Processor Score"
        .Cells(1, 23) = "Teleop Net Score"
        
        ' Endgame Headers
        .Cells(1, 24) = "On Stage"
        .Cells(1, 25) = "Spotlit"
        .Cells(1, 26) = "Harmony"
        .Cells(1, 27) = "Trap"
        .Cells(1, 28) = "Parked"
        .Cells(1, 29) = "Driver Skill"
        .Cells(1, 30) = "Defense Rating"
        .Cells(1, 31) = "Speed Rating"
        .Cells(1, 32) = "Comments"
        
        ' Format Headers
        With ws.Range(ws.Cells(1, 1), ws.Cells(1, 32))
            .Font.Bold = True
            .Interior.Color = RGB(200, 200, 200)
        End With
    End With
End Sub
