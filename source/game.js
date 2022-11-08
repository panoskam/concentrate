// αρίθμηση κελιών
//       ... 63
//  8 ...
//  0 1 2 ... 7


let inp = null;
let scr = null;
let aud = null;
let started=false;
let found=0;
let release_time = null;

let tile_black=57;
let tile_blue=27;
let tile_green=26;
let tile_red=25;

let tile_first=null;
let tile_second=null;

const letters=new Array(64);
// 0: δεν έχει ανοιχτεί (μπλε)
// 1: έχει ανοιχτεί (κόκκινο)
// 2: έχει βρεθεί (πράσινο+γράμμα)
let letters_status=new Array(64);
// 0: δεν έχει γίνει επιλογή
// 1: έχει επιλεχθεί το πρώτο
// 2: έχει επιλεχθεί το δεύτερο και επιτυχία
// 3: έχει επιλεχθεί το δεύτερο και αποτυχία
let phase=0;

// αρχικοποίηση
engine.onInit = () => 
{
	inp = engine.input;
	scr = engine.screen;
	aud = engine.audio;
	pos=0;
  // δημιουργία πίνακα
  // αντιστοίχιση γράμματος σε θέση
	for (i=0; i<64; i++)
	{
	  do
	  {
	    pos=Math.floor(Math.random()*64);
	  }
    while (letters[pos]!==undefined)
    letters[pos]=i;
	}
  // αντιστοίχιση θέσεων σε Tile
	for (i=0; i<64; i++)
	{
	  // συμβατότηα με Tilemap
	  letters[i]++;
    if (letters[i]<33)
    {
      letters[i]+=32;
    }
    // αρχική κατάσταση
    letters_status[i]=0;
	}
};

// ενημέρωση (λογική παιχνιδιού)
engine.onUpdate = () => 
{
  // αν το παιχνίδι δε ξεκίνησε
  // (αντίστροφη μέτρηση)
  if (!started)
  {
    // εμφάνιση αντίστροφης μέτρησης
    scr.clear(0);
  	scr.drawText('Pair matching tiles!', 24, 42, 10, 9, 1);
  	scr.drawText('Just Concentrate!', 15, 80, 14, 2, 0);
    // εμφάνιση χρόνου
    if (engine.realTimeSinceInit<5)
    {
      scr.drawText(5-parseInt(engine.realTimeSinceInit)+'', 60, 60, 14, 2, 0);
    }
    else
    {
      // εμφάνιση Go!
      if (engine.realTimeSinceInit<6)
      {
        scr.drawText('Go!', 55, 60, 14, 2, 0);
      }
      else
      // τοποθέτηση Concentrate!
      {
        scr.clear(0);
      	scr.drawText('Concentrate!', 1, 132, 2, 14, 0);
        started=true;
        engine.screen.drawMap(0, 0, -1, -1, 0, 0, 0);
      }
    }
  }
  // αν το παιχνίδι ξεκίνησε
  else
  {
    // εμφάνιση χρόνου
    scr.drawRect(102, 131, 50, 50, 1);
    if (found<32) scr.drawText(engine.realTimeSinceInit+'', 103, 132, 14, 2, 1);
    // εμφάνιση προόδου
    scr.drawRect(76, 131, 22, 50, 1);
    scr.drawText(found+'/32', 77, 132, 14, 10, 1);
    // αν δεν έχει επιλεχθεί δεύτερο γράμμα
    if (phase<2)
    {
      // αν έχει γίνει κλικ
      if (inp.mouse.left.up)
      {
        // υπολογισμός tile που έγινε κλικ
        sel_row=Math.floor(inp.mouse.position.y/16);
        sel_col=Math.floor(inp.mouse.position.x/16);
        sel_tile=sel_row*8+sel_col;
        // αν είναι έγκυρο tile
        // (αν είναι εντός πινακα και δεν έχει ανοίξει και δεν έχει επιλεχθεί)
        if (sel_tile<64 && letters_status[sel_tile]<2 && (phase==0 || tile_first!=sel_tile))
        {
          scr.drawTile(32, sel_col*16, sel_row*16);
          scr.drawTile(letters[sel_tile], sel_col*16, sel_row*16);
          // αν δεν έχει επιλεχθεί πρώτο γράμμα
          if (phase==0)
          {
            letters_status[sel_tile]=1;
            phase=1;
            tile_first=sel_tile;
          }
          // αν  έχει επιλεχθεί πρώτο γράμμα
          else
          {
            // ορισμός αναμονής
            release_time=engine.realTimeSinceInit+1;  
            tile_second=sel_tile;
            // σωστό ζευγάρι γραμμάτων
            if (letters[tile_first]==letters[tile_second])
            {
              aud.playSound(1, bitmelo.Notes.C4, 20, 1, 1);
              aud.playSound(1, bitmelo.Notes.E4, 20, 1, 1);
              aud.playSound(1, bitmelo.Notes.G4, 20, 1, 1);
              letters_status[tile_first]=2;
              letters_status[tile_second]=2;
              phase=2;
              found++;
              engine.screen.drawRect(40, 40, 48, 48, 4);
              engine.screen.drawRectBorder(40, 40, 48, 48, 2);
              scr.drawText(found+' !', 55, 60, 12, 2, 0);
            }
            else
            // λάθος ζευγάρι γραμμάτων
            {
              aud.playSound(1, bitmelo.Notes.A4, 20, 1, 1);
              aud.playSound(1, bitmelo.Notes.C4, 20, 1, 1);
              aud.playSound(1, bitmelo.Notes.E4, 20, 1, 1);
              letters_status[sel_tile]=1;
              phase=3;
            }
          }
        }
        // άκυρο κλικ
        else
        {
          aud.playSound(1, bitmelo.Notes.A3, 10, 1, 1);
          aud.playSound(1, bitmelo.Notes.C3, 10, 1, 1);
          aud.playSound(1, bitmelo.Notes.E3, 10, 1, 1);
          aud.playSound(1, bitmelo.Notes.G3, 10, 1, 1);
        }
      }
    }
    else
    // αν δεν έχει γίνει κλικ
    {
      // αν έχει παρέλθει η αναμονή
      if (engine.realTimeSinceInit>release_time)
      {
        // λάθος ζευγάρι γραμμάτων
        if (phase==3)
        {
          // κλείσιμο γραμμάτων (κόκκινο)
          scr.drawTile(tile_red, (tile_first%8)*16, Math.floor(tile_first/8)*16);
          scr.drawTile(tile_red, (tile_second%8)*16, Math.floor(tile_second/8)*16);
        }
        else
        {
          // σχηματισμός πίνακα
          engine.screen.drawRect(40, 40, 48, 48, 1);
          for (i=0; i<64; i++)
          {
            if (letters_status[i]==0)
            {
              scr.drawTile(tile_blue, (i%8)*16, Math.floor(i/8)*16);
            }
            else
            {
              if (letters_status[i]==1)
              {
                scr.drawTile(tile_red, (i%8)*16, Math.floor(i/8)*16);
              }
              else
              {
                scr.drawTile(tile_green, (i%8)*16, Math.floor(i/8)*16);
                scr.drawTile(letters[i], (i%8)*16, Math.floor(i/8)*16);
              }
            }
          }
          // τέλος παιχνιδιού
          if (found==32)
          {
              aud.playSound(1, bitmelo.Notes.C4, 40, 1, 1);
              aud.playSound(1, bitmelo.Notes.E4, 40, 1, 1);
              aud.playSound(1, bitmelo.Notes.G4, 40, 1, 1);
              aud.playSound(1, bitmelo.Notes.B4, 40, 1, 1);
              engine.screen.drawRect(20, 40, 88, 48, 4);
              engine.screen.drawRectBorder(20, 40, 88, 48, 2);
              final_time=engine.realTimeSinceInit;
              scr.drawText('Congrats!', 37, 69, 12, 2, 0);
              scr.drawText('Time: '+Math.floor(final_time/60)+"m"+Math.floor((final_time%60))+"s", 37, 54, 15, 2, 0);
          }
        }
        // ορισμός κατάστασης
        phase=0;
      }
    }
  }
};

