import statbotics
import xlwings as xw
import pandas as pd
import sys
from datetime import datetime

try:
    # Initialize API
    sb = statbotics.Statbotics()
    
    # Define the event key for 2025 Mishawaka FIN
    event_key = "2025inmis"  # Format is typically year + event code
    event_year = 2025
    
    print(f"Fetching EPA data for event: {event_key} (Year: {event_year})")
    
    # Open Excel file
    print("Opening Excel file...")
    wb = xw.Book("scouting_excel.xlsx")
    
    # Create a new sheet for the EPA data with timestamp
    timestamp = datetime.now().strftime("%m%d_%H%M")
    epa_sheet_name = f"EPA_Data_{timestamp}"
    
    # Get available sheets
    sheet_names = [sheet.name for sheet in wb.sheets]
    print(f"Available sheets: {sheet_names}")
    
    # Check if sheet already exists, delete if it does
    if epa_sheet_name in sheet_names:
        wb.sheets[epa_sheet_name].delete()
    
    # Add new sheet for EPA data
    epa_sheet = wb.sheets.add(epa_sheet_name, after=wb.sheets[-1])
    print(f"Created new sheet for EPA data: {epa_sheet_name}")
    
    # Try to get event data
    try:
        # Get event details
        event_data = sb.get_event(event_key)
        print(f"Event data retrieved: {event_data.get('name', 'Unknown Event')}")
        
        # Write event details to sheet
        epa_sheet.range("A1").value = f"EPA Data for {event_data.get('name', 'Unknown Event')} ({event_year})"
        epa_sheet.range("A1").font.bold = True
        
        # Get teams from Indiana (since we can't get event teams directly)
        print("\nFetching teams from Indiana for EPA data...")
        indiana_teams = sb.get_teams(state="IN")
        print(f"Found {len(indiana_teams) if indiana_teams else 0} teams in Indiana")
        
        if indiana_teams:
            # Prepare EPA data as a list for later conversion to DataFrame
            all_epa_data = []
            
            # Get EPA data for each team
            for team in indiana_teams:
                team_number = team.get('team')
                team_name = team.get('name', 'Unknown')
                
                try:
                    # Get detailed team data with EPA
                    detailed_team_data = sb.get_team(team_number)
                    
                    if detailed_team_data:
                        # Extract EPA data
                        epa = detailed_team_data.get('epa', 'N/A')
                        epa_rank = detailed_team_data.get('epa_rank', 'N/A')
                        
                        # Try to get more specific EPA metrics if available
                        epa_recent = detailed_team_data.get('epa_recent', None)
                        epa_year = detailed_team_data.get('epa_year', None)
                        epa_pre_champs = detailed_team_data.get('epa_pre_champs', None)
                        
                        # Add to our data list
                        all_epa_data.append({
                            'Team Number': team_number,
                            'Team Name': team_name,
                            'EPA': epa,
                            'EPA Rank': epa_rank,
                            'EPA Recent': epa_recent,
                            'EPA Year': epa_year,
                            'EPA Pre-Champs': epa_pre_champs
                        })
                        
                        print(f"Added EPA data for Team {team_number}: {team_name} - EPA: {epa}")
                except Exception as team_error:
                    print(f"Error getting EPA data for team {team_number}: {str(team_error)}")
            
            # Convert to DataFrame for easier sorting
            if all_epa_data:
                df = pd.DataFrame(all_epa_data)
                
                # Convert EPA to numeric for proper sorting
                df['EPA'] = pd.to_numeric(df['EPA'], errors='coerce')
                
                # Sort by EPA (descending)
                df = df.sort_values(by='EPA', ascending=False)
                
                # Write headers
                epa_headers = ["Team Number", "Team Name", "EPA", "EPA Rank", "EPA Recent", "EPA Year", "EPA Pre-Champs"]
                epa_sheet.range("A3").value = [epa_headers]
                epa_sheet.range("A3").font.bold = True
                
                # Write sorted data
                epa_sheet.range("A4").value = df.values.tolist()
                
                print(f"Added EPA data for {len(all_epa_data)} teams, sorted by EPA (highest to lowest)")
            else:
                epa_sheet.range("A3").value = "No EPA data found for teams in Indiana"
        else:
            epa_sheet.range("A3").value = "No teams found in Indiana"
    
    except Exception as e:
        print(f"Error fetching event data: {str(e)}")
        epa_sheet.range("A1").value = f"Error fetching event data: {str(e)}"
    
    # Auto-fit columns
    epa_sheet.autofit()
    
    # Save the workbook
    wb.save()
    
    print(f"\nExcel updated with EPA data in sheet '{epa_sheet_name}'!")
    
except Exception as e:
    print(f"Error: {str(e)}")
    sys.exit(1)