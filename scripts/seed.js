import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

// Manually configure Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: "concert-e249e.firebaseapp.com",
  projectId: "concert-e249e",
  storageBucket: "concert-e249e.appspot.com",
  messagingSenderId: "108305364843",
  appId: "1:108305364843:web:6022afa72688439499252c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const budgetCategories = [
  { id: 'prodcat1001', summaryGroup: 'Creatives', department: 'Creative Fees', subDepartment: 'Direction', lineItem: 'Director' },
  { id: 'prodcat1002', summaryGroup: 'Creatives', department: 'Creative Fees', subDepartment: 'Direction', lineItem: 'Assistant Director' },
  { id: 'prodcat1003', summaryGroup: 'Creatives', department: 'Creative Fees', subDepartment: 'Direction', lineItem: 'Choreographer' },
  { id: 'prodcat1004', summaryGroup: 'Creatives', department: 'Creative Fees', subDepartment: 'Lighting', lineItem: 'Lighting Designer' },
  { id: 'prodcat1005', summaryGroup: 'Creatives', department: 'Creative Fees', subDepartment: 'Sound', lineItem: 'Sound Designer' },
  { id: 'prodcat1006', summaryGroup: 'Creatives', department: 'Creative Fees', subDepartment: 'Set & Costume', lineItem: 'Set and Costume Designer' },
  { id: 'prodcat1007', summaryGroup: 'Creatives', department: 'Creative Fees', subDepartment: 'Set', lineItem: 'Set Designer' },
  { id: 'prodcat1008', summaryGroup: 'Creatives', department: 'Creative Fees', subDepartment: 'Costume', lineItem: 'Costume Designer' },
  { id: 'prodcat1009', summaryGroup: 'Creatives', department: 'Creative Fees', subDepartment: 'WHAM', lineItem: 'Wig Designer' },
  { id: 'prodcat1010', summaryGroup: 'Creatives', department: 'Creative Fees', subDepartment: 'WHAM', lineItem: 'Make-Up Designer' },
  { id: 'prodcat1011', summaryGroup: 'Creatives', department: 'Creative Fees', subDepartment: 'AV', lineItem: 'AV Designer' },
  { id: 'prodcat1012', summaryGroup: 'Creatives', department: 'Creative Fees', subDepartment: 'AV', lineItem: 'AV Programmer' },
  { id: 'prodcat1013', summaryGroup: 'Creatives', department: 'Creative Fees', subDepartment: 'Casting', lineItem: 'Casting Director' },
  { id: 'prodcat1014', summaryGroup: 'Creatives', department: 'Creative Fees', subDepartment: 'Production', lineItem: 'Concert Production Manager' },
  { id: 'prodcat1015', summaryGroup: 'Creatives', department: 'Creative Fees', subDepartment: 'Lighting', lineItem: 'Lighting Programmer' },
  { id: 'prodcat1016', summaryGroup: 'Rehearsal Costs', department: 'Rehearsal Room', subDepartment: '', lineItem: 'Main Room Hire' },
  { id: 'prodcat1017', summaryGroup: 'Rehearsal Costs', department: 'Rehearsal Room', subDepartment: '', lineItem: 'Second Room Hire' },
  { id: 'prodcat1018', summaryGroup: 'Rehearsal Costs', department: 'Rehearsal Room', subDepartment: '', lineItem: 'Sitzprobe' },
  { id: 'prodcat1019', summaryGroup: 'Rehearsal Costs', department: 'Rehearsal Room', subDepartment: '', lineItem: 'Audition Room' },
  { id: 'prodcat1020', summaryGroup: 'Rehearsal Costs', department: 'Crew', subDepartment: '', lineItem: 'Crew' },
  { id: 'prodcat1021', summaryGroup: 'Rehearsal Costs', department: 'Hires', subDepartment: '', lineItem: 'Hires' },
  { id: 'prodcat1022', summaryGroup: 'Rehearsal Costs', department: 'Transport', subDepartment: '', lineItem: 'Transport' },
  { id: 'prodcat1023', summaryGroup: 'Rehearsal Costs', department: 'Petty Cash', subDepartment: '', lineItem: 'Petty Cash' },
  { id: 'prodcat1024', summaryGroup: 'Rehearsal Costs', department: 'Expenses', subDepartment: '', lineItem: 'Expenses' },
  { id: 'prodcat1025', summaryGroup: 'Rehearsal Costs', department: 'Misc', subDepartment: '', lineItem: 'Misc' },
  { id: 'prodcat1026', summaryGroup: 'Salaries & Fees', department: 'Cast', subDepartment: 'Artist', lineItem: 'Artist Name' },
  { id: 'prodcat1027', summaryGroup: 'Salaries & Fees', department: 'Stage Management', subDepartment: '', lineItem: 'Company Manager' },
  { id: 'prodcat1028', summaryGroup: 'Salaries & Fees', department: 'Stage Management', subDepartment: '', lineItem: 'Assistant Stage Manager' },
  { id: 'prodcat1029', summaryGroup: 'Salaries & Fees', department: 'Stage Management', subDepartment: '', lineItem: 'Stage Manager' },
  { id: 'prodcat1030', summaryGroup: 'Salaries & Fees', department: 'Stage Management', subDepartment: '', lineItem: 'Company Stage Manager' },
  { id: 'prodcat1031', summaryGroup: 'Salaries & Fees', department: 'Stage Management', subDepartment: '', lineItem: 'Deputy Stage Manager' },
  { id: 'prodcat1032', summaryGroup: 'Salaries & Fees', department: 'Wardrobe', subDepartment: '', lineItem: 'Costume Supervisor' },
  { id: 'prodcat1033', summaryGroup: 'Salaries & Fees', department: 'Wardrobe', subDepartment: '', lineItem: 'Wardrobe Supervisor' },
  { id: 'prodcat1034', summaryGroup: 'Salaries & Fees', department: 'Wardrobe', subDepartment: '', lineItem: 'Wardrobe Assistant' },
  { id: 'prodcat1035', summaryGroup: 'Salaries & Fees', department: 'Props', subDepartment: '', lineItem: 'Props Supervisor' },
  { id: 'prodcat1036', summaryGroup: 'Salaries & Fees', department: 'Props', subDepartment: '', lineItem: 'Props Assistant' },
  { id: 'prodcat1037', summaryGroup: 'Salaries & Fees', department: 'WHAM', subDepartment: '', lineItem: 'Wigs, Hair & Make-Up' },
  { id: 'prodcat1038', summaryGroup: 'Salaries & Fees', department: 'WHAM', subDepartment: '', lineItem: 'Wigs, Hair & Make-Up Assistants' },
  { id: 'prodcat1039', summaryGroup: 'Salaries & Fees', department: 'Sound', subDepartment: '', lineItem: 'Sound 1' },
  { id: 'prodcat1040', summaryGroup: 'Salaries & Fees', department: 'Sound', subDepartment: '', lineItem: 'Sound 2' },
  { id: 'prodcat1041', summaryGroup: 'Salaries & Fees', department: 'Sound', subDepartment: '', lineItem: 'Senior Production Sound Engineer' },
  { id: 'prodcat1042', summaryGroup: 'Salaries & Fees', department: 'Sound', subDepartment: '', lineItem: 'Production Sound Engineer' },
  { id: 'prodcat1043', summaryGroup: 'Salaries & Fees', department: 'LX', subDepartment: '', lineItem: 'Senior LX' },
  { id: 'prodcat1044', summaryGroup: 'Salaries & Fees', department: 'LX', subDepartment: '', lineItem: 'Production LX' },
  { id: 'prodcat1045', summaryGroup: 'Salaries & Fees', department: 'LX', subDepartment: '', lineItem: 'Lighting Assistant' },
  { id: 'prodcat1046', summaryGroup: 'Salaries & Fees', department: 'LX', subDepartment: '', lineItem: 'Spot Operators' },
  { id: 'prodcat1047', summaryGroup: 'Salaries & Fees', department: 'Runners', subDepartment: '', lineItem: 'Artist Runner' },
  { id: 'prodcat1048', summaryGroup: 'Salaries & Fees', department: 'Runners', subDepartment: '', lineItem: 'Production Runner' },
  { id: 'prodcat1049', summaryGroup: 'Salaries & Fees', department: 'Band', subDepartment: 'Music', lineItem: 'Musical Director / Band 1' },
  { id: 'prodcat1050', summaryGroup: 'Salaries & Fees', department: 'Band', subDepartment: 'Choir', lineItem: 'Choir' },
  { id: 'prodcat1051', summaryGroup: 'Salaries & Fees', department: 'Band', subDepartment: 'Music', lineItem: 'Assistant Musical Director' },
  { id: 'prodcat1052', summaryGroup: 'Salaries & Fees', department: 'Band', subDepartment: 'Band', lineItem: 'Band Provision' },
  { id: 'prodcat1053', summaryGroup: 'Physical Production', department: 'Physical Set', subDepartment: '', lineItem: 'Set & Props + Risers' },
  { id: 'prodcat1054', summaryGroup: 'Physical Production', department: 'Physical Set', subDepartment: '', lineItem: 'Costumes, Wigs & Make-Up' },
  { id: 'prodcat1055', summaryGroup: 'Physical Production', department: 'Hires', subDepartment: 'Sound', lineItem: 'Sound Hires' },
  { id: 'prodcat1056', summaryGroup: 'Physical Production', department: 'Hires', subDepartment: 'Sound', lineItem: 'RF Radio Licence' },
  { id: 'prodcat1057', summaryGroup: 'Physical Production', department: 'Hires', subDepartment: 'Staging', lineItem: 'Music Stands / Chairs / Piano' },
  { id: 'prodcat1058', summaryGroup: 'Physical Production', department: 'Hires', subDepartment: 'AV', lineItem: 'Video Wall / Projector Provision' },
  { id: 'prodcat1059', summaryGroup: 'Physical Production', department: 'Hires', subDepartment: 'Lighting', lineItem: 'Lighting Previz' },
  { id: 'prodcat1060', summaryGroup: 'Physical Production', department: 'Hires', subDepartment: 'Lighting', lineItem: 'Lighting Hires' },
  { id: 'prodcat1061', summaryGroup: 'Physical Production', department: 'Purchases', subDepartment: '', lineItem: 'Electrics Purchases' },
  { id: 'prodcat1062', summaryGroup: 'Physical Production', department: 'Purchases', subDepartment: '', lineItem: 'Sound Purchases and Prep' },
  { id: 'prodcat1063', summaryGroup: 'Physical Production', department: 'Purchases', subDepartment: '', lineItem: 'Wardrobe Set-Up' },
  { id: 'prodcat1064', summaryGroup: 'Physical Production', department: 'Purchases', subDepartment: '', lineItem: 'Stage Management Set-Up' },
  { id: 'prodcat1065', summaryGroup: 'Physical Production', department: 'Purchases', subDepartment: '', lineItem: 'Click Track Recordings' },
  { id: 'prodcat1066', summaryGroup: 'Physical Production', department: 'Purchases', subDepartment: '', lineItem: 'Misc' },
  { id: 'prodcat1067', summaryGroup: 'Advertising & Marketing / Merch', department: 'Props', subDepartment: '', lineItem: 'PR' },
  { id: 'prodcat1068', summaryGroup: 'Advertising & Marketing / Merch', department: 'Marketing', subDepartment: '', lineItem: 'Advertising and Marketing Spend' },
  { id: 'prodcat1069', summaryGroup: 'Advertising & Marketing / Merch', department: 'Design', subDepartment: '', lineItem: 'Design Work' },
  { id: 'prodcat1070', summaryGroup: 'Advertising & Marketing / Merch', department: 'Marketing', subDepartment: '', lineItem: 'Advertising and Marketing Fee' },
  { id: 'prodcat1071', summaryGroup: 'Advertising & Marketing / Merch', department: 'Merchandise', subDepartment: 'Merch', lineItem: 'Merch Design' },
  { id: 'prodcat1072', summaryGroup: 'Advertising & Marketing / Merch', department: 'Merchandise', subDepartment: 'Programme', lineItem: 'Programme Design' },
  { id: 'prodcat1073', summaryGroup: 'Advertising & Marketing / Merch', department: 'Merchandise', subDepartment: 'Programme', lineItem: 'Programme Content' },
  { id: 'prodcat1074', summaryGroup: 'Advertising & Marketing / Merch', department: 'Merchandise', subDepartment: 'Programme', lineItem: 'Programme Printing' },
  { id: 'prodcat1075', summaryGroup: 'Advertising & Marketing / Merch', department: 'Merchandise', subDepartment: 'Merch', lineItem: 'Merch Creation' },
  { id: 'prodcat1076', summaryGroup: 'Administration', department: 'General Management', subDepartment: '', lineItem: 'GM' },
  { id: 'prodcat1077', summaryGroup: 'Administration', department: 'Producer Fee', subDepartment: '', lineItem: 'Producer Fee' },
  { id: 'prodcat1078', summaryGroup: 'Administration', department: 'EP Fee', subDepartment: '', lineItem: 'Executive Producer Fee' },
  { id: 'prodcat1079', summaryGroup: 'Administration', department: 'Accounting', subDepartment: '', lineItem: 'Accountancy / TTR' },
  { id: 'prodcat1080', summaryGroup: 'Legal', department: 'Legal', subDepartment: '', lineItem: 'Legal Fees' },
  { id: 'prodcat1081', summaryGroup: 'Administration', department: 'Travel & Accom', subDepartment: 'Hotels', lineItem: 'Creative Hotels' },
  { id: 'prodcat1082', summaryGroup: 'Administration', department: 'Travel & Accom', subDepartment: 'Hotels', lineItem: 'Production Hotels' },
  { id: 'prodcat1083', summaryGroup: 'Administration', department: 'Travel & Accom', subDepartment: 'Expenses', lineItem: 'Creative / Production Expenses' },
  { id: 'prodcat1084', summaryGroup: 'Administration', department: 'Travel & Accom', subDepartment: 'Travel', lineItem: 'Airport Transfers' },
  { id: 'prodcat1085', summaryGroup: 'Administration', department: 'Travel & Accom', subDepartment: 'Travel', lineItem: 'Profile Artist Daily Cars' },
  { id: 'prodcat1086', summaryGroup: 'Administration', department: 'Travel & Accom', subDepartment: 'Travel', lineItem: 'Taxis' },
  { id: 'prodcat1087', summaryGroup: 'Administration', department: 'Travel & Accom', subDepartment: 'Visa', lineItem: 'Visa' },
  { id: 'prodcat1088', summaryGroup: 'Administration', department: 'Travel & Accom', subDepartment: 'Travel', lineItem: 'Profile Flights' },
  { id: 'prodcat1089', summaryGroup: 'Administration', department: 'Travel & Accom', subDepartment: 'Travel', lineItem: 'Flights' },
  { id: 'prodcat1090', summaryGroup: 'Administration', department: 'Travel & Accom', subDepartment: 'Hotels', lineItem: 'Profile Hotels' },
  { id: 'prodcat1091', summaryGroup: 'Administration', department: 'Travel & Accom', subDepartment: 'Hotels', lineItem: 'Artist Team Hotels' },
  { id: 'prodcat1092', summaryGroup: 'Administration', department: 'Travel & Accom', subDepartment: 'Per Diem', lineItem: 'Per Diem' },
  { id: 'prodcat1093', summaryGroup: 'Administration', department: 'Travel & Accom', subDepartment: 'Travel', lineItem: 'Daily Travel' },
  { id: 'prodcat1094', summaryGroup: 'Administration', department: 'Insurance', subDepartment: '', lineItem: 'Insurance - PLI & ELI' },
  { id: 'prodcat1095', summaryGroup: 'Administration', department: 'Insurance', subDepartment: '', lineItem: 'Insurance - Key Performer' },
  { id: 'prodcat1096', summaryGroup: 'Administration', department: 'Insurance', subDepartment: '', lineItem: 'Insurance - Cancellation' },
  { id: 'prodcat1097', summaryGroup: 'Administration', department: 'Accounting', subDepartment: '', lineItem: 'Bank Charges - International' },
  { id: 'prodcat1098', summaryGroup: 'Advertising & Marketing / Merch', department: 'Photography', subDepartment: '', lineItem: 'Photography' },
  { id: 'prodcat1099', summaryGroup: 'Administration', department: 'Accounting', subDepartment: '', lineItem: 'Producer / GM Expenses (Pre-Production)' },
  { id: 'prodcat1100', summaryGroup: 'Venue', department: 'Venue', subDepartment: '', lineItem: 'Full Venue Hire' },
  { id: 'prodcat1101', summaryGroup: 'Venue', department: 'Venue', subDepartment: '', lineItem: 'Matinee Venue Hire' },
  { id: 'prodcat1102', summaryGroup: 'Venue', department: 'Venue', subDepartment: '', lineItem: 'Extra Hours Get in' },
  { id: 'prodcat1103', summaryGroup: 'Venue', department: 'Venue', subDepartment: '', lineItem: 'Second Day venue hire' },
  { id: 'prodcat1104', summaryGroup: 'Venue', department: 'Venue', subDepartment: '', lineItem: 'Extra Hours Get Out' },
];

const seedDatabase = async () => {
  const budgetCollectionRef = collection(db, 'budgetCategories');
  
  try {
    console.log('Checking for existing data...');
    const snapshot = await getDocs(budgetCollectionRef);
    if (!snapshot.empty) {
      console.log('Budget categories collection is not empty. Clearing existing data...');
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('Existing data cleared.');
    }

    console.log('Seeding Firestore with new budget categories...');
    const batch = writeBatch(db);
    budgetCategories.forEach(category => {
      const newDocRef = doc(collection(db, 'budgetCategories'));
      batch.set(newDocRef, category);
    });
    await batch.commit();

    console.log('Success: Firestore database has been seeded with budget categories.');
  } catch (error) {
    console.error('Error seeding Firestore database:', error);
  }
};

seedDatabase();
