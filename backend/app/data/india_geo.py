"""
All 28 States and 8 Union Territories of India and their complete districts.
Provides complete fallback and standalone geo-data for the SHWF Health Report Card Platform.
"""

import uuid
import re

def slugify(text: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

# 28 States + 8 Union Territories with all their official districts
INDIA_STATES_AND_DISTRICTS = [
    {
        "name": "Andhra Pradesh",
        "type": "State",
        "districts": [
            "Alluri Sitharama Raju", "Anakapalli", "Ananthapuramu", "Annamayya", 
            "Bapatla", "Chittoor", "Dr. B.R. Ambedkar Konaseema", "East Godavari", 
            "Eluru", "Guntur", "Kakinada", "Krishna", "Kurnool", "Nandyal", 
            "NTR", "Palnadu", "Parvathipuram Manyam", "Prakasam", 
            "Sri Potti Sriramulu Nellore", "Sri Sathya Sai", "Srikakulam", 
            "Tirupati", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"
        ]
    },
    {
        "name": "Arunachal Pradesh",
        "type": "State",
        "districts": [
            "Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", 
            "Itanagar Capital Complex", "Kamle", "Kra Daadi", "Kurung Kumey", 
            "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley", "Lower Siang", 
            "Lower Subansiri", "Namsai", "Pakke Kessang", "Papum Pare", "Shi Yomi", 
            "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", 
            "West Kameng", "West Siang"
        ]
    },
    {
        "name": "Assam",
        "type": "State",
        "districts": [
            "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", 
            "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", 
            "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", 
            "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", 
            "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", 
            "Sonitpur", "South Salmara-Mankachar", "Tamulpur", "Tinsukia", 
            "Udalguri", "West Karbi Anglong"
        ]
    },
    {
        "name": "Bihar",
        "type": "State",
        "districts": [
            "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", 
            "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", 
            "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", 
            "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", 
            "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", 
            "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", 
            "Siwan", "Supaul", "Vaishali", "West Champaran"
        ]
    },
    {
        "name": "Chhattisgarh",
        "type": "State",
        "districts": [
            "Balod", "Baloda Bazar-Bhatapara", "Balrampur-Ramanujganj", "Bemetara", 
            "Bijapur", "Bilaspur", "Dantewada (South Bastar)", "Dhamtari", "Durg", 
            "Gariaband", "Gaurela-Pendra-Marwahi", "Janjgir-Champa", "Jashpur", 
            "Kabirdham (Kawardha)", "Kanker (North Bastar)", "Khairagarh-Chhuikhadan-Gandai", 
            "Kondagaon", "Korba", "Koriya", "Mahasamund", "Manendragarh-Chirmiri-Bharatpur", 
            "Mohla-Manpur-Ambagarh Chowki", "Mungeli", "Narayanpur", "Raigarh", 
            "Raipur", "Rajnandgaon", "Sarangarh-Bilaigarh", "Sakti", "Sukma", 
            "Surajpur", "Surguja"
        ]
    },
    {
        "name": "Goa",
        "type": "State",
        "districts": [
            "North Goa", "South Goa"
        ]
    },
    {
        "name": "Gujarat",
        "type": "State",
        "districts": [
            "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", 
            "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", 
            "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", 
            "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", 
            "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", 
            "Tapi", "Vadodara", "Valsad"
        ]
    },
    {
        "name": "Haryana",
        "type": "State",
        "districts": [
            "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", 
            "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", 
            "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", 
            "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"
        ]
    },
    {
        "name": "Himachal Pradesh",
        "type": "State",
        "districts": [
            "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", 
            "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"
        ]
    },
    {
        "name": "Jharkhand",
        "type": "State",
        "districts": [
            "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", 
            "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", 
            "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", 
            "Ramgarh", "Ranchi", "Sahebganj", "Seraikela Kharsawan", "Simdega", 
            "West Singhbhum"
        ]
    },
    {
        "name": "Karnataka",
        "type": "State",
        "districts": [
            "Bagalkote", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", 
            "Bidar", "Chamarajanagara", "Chikkaballapura", "Chikkamagaluru", 
            "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", 
            "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", 
            "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", 
            "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara", "Vijayapura", "Yadgir"
        ]
    },
    {
        "name": "Kerala",
        "type": "State",
        "districts": [
            "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", 
            "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", 
            "Thiruvananthapuram", "Thrissur", "Wayanad"
        ]
    },
    {
        "name": "Madhya Pradesh",
        "type": "State",
        "districts": [
            "Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", 
            "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", 
            "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", 
            "Guna", "Gwalior", "Harda", "Indore", "Jabalpur", "Jhabua", 
            "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", 
            "Narsinghpur", "Neemuch", "Niwari", "Narmadapuram (Hoshangabad)", 
            "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", 
            "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", 
            "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", 
            "Umaria", "Vidisha"
        ]
    },
    {
        "name": "Maharashtra",
        "type": "State",
        "districts": [
            "Ahmednagar", "Akola", "Amravati", "Chhatrapati Sambhaji Nagar", 
            "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", 
            "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", 
            "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", 
            "Nashik", "Dharashiv (Osmanabad)", "Palghar", "Parbhani", "Pune", 
            "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", 
            "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
        ]
    },
    {
        "name": "Manipur",
        "type": "State",
        "districts": [
            "Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", 
            "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", 
            "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"
        ]
    },
    {
        "name": "Meghalaya",
        "type": "State",
        "districts": [
            "East Garo Hills", "East Jaintia Hills", "East Khasi Hills", 
            "Eastern West Khasi Hills", "North Garo Hills", "Ri Bhoi", 
            "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", 
            "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"
        ]
    },
    {
        "name": "Mizoram",
        "type": "State",
        "districts": [
            "Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", 
            "Lawngtlai", "Lunglei", "Mamit", "Saitual", "Serchhip", "Siaha"
        ]
    },
    {
        "name": "Nagaland",
        "type": "State",
        "districts": [
            "Chumoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", 
            "Mokokchung", "Mon", "Niuland", "Noklak", "Peren", "Phek", 
            "Shamator", "Tseminyu", "Tuensang", "Wokha", "Zunheboto"
        ]
    },
    {
        "name": "Odisha",
        "type": "State",
        "districts": [
            "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", 
            "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", 
            "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", 
            "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", 
            "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", 
            "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
        ]
    },
    {
        "name": "Punjab",
        "type": "State",
        "districts": [
            "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", 
            "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", 
            "Kapurthala", "Ludhiana", "Malerkotla", "Mansa", "Moga", "Muktsar", 
            "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar (Mohali)", 
            "Sangrur", "Shahid Bhagat Singh Nagar", "Sri Muktsar Sahib", "Tarn Taran"
        ]
    },
    {
        "name": "Rajasthan",
        "type": "State",
        "districts": [
            "Ajmer", "Alwar", "Anupgarh", "Balotra", "Banswara", "Baran", 
            "Barmer", "Beawar", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", 
            "Chittorgarh", "Churu", "Dausa", "Deeg", "Dholpur", "Didwana-Kuchaman", 
            "Dudu", "Dungarpur", "Gangapur City", "Hanumangarh", "Jaipur", 
            "Jaipur Rural", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", 
            "Jodhpur", "Jodhpur Rural", "Karauli", "Kekri", "Khairthal-Tijara", 
            "Kota", "Kotputli-Behror", "Nagaur", "Neem Ka Thana", "Pali", 
            "Phalodi", "Pratapgarh", "Rajsamand", "Salumbar", "Sanchore", 
            "Sawai Madhopur", "Shahpura", "Sikar", "Sirohi", "Sri Ganganagar", 
            "Tonk", "Udaipur"
        ]
    },
    {
        "name": "Sikkim",
        "type": "State",
        "districts": [
            "Gangtok", "Gyalshing", "Mangan", "Namchi", "Pakyong", "Soreng"
        ]
    },
    {
        "name": "Tamil Nadu",
        "type": "State",
        "districts": [
            "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", 
            "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", 
            "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", 
            "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", 
            "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", 
            "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", 
            "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", 
            "Vellore", "Viluppuram", "Virudhunagar"
        ]
    },
    {
        "name": "Telangana",
        "type": "State",
        "districts": [
            "Adilabad", "Bhadradri Kothagudem", "Hanumakonda", "Hyderabad", 
            "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", 
            "Kamareddy", "Karimnagar", "Khammam", "Kumuram Bheem Asifabad", 
            "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", 
            "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", 
            "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", 
            "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", 
            "Warangal", "Yadadri Bhuvanagiri"
        ]
    },
    {
        "name": "Tripura",
        "type": "State",
        "districts": [
            "Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", 
            "South Tripura", "Unakoti", "West Tripura"
        ]
    },
    {
        "name": "Uttar Pradesh",
        "type": "State",
        "districts": [
            "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", 
            "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", 
            "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", 
            "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", 
            "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", 
            "Gautam Buddha Nagar (Noida)", "Ghaziabad", "Ghazipur", "Gonda", 
            "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", 
            "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", 
            "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", 
            "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", 
            "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", 
            "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", 
            "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", 
            "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", 
            "Sultanpur", "Unnao", "Varanasi"
        ]
    },
    {
        "name": "Uttarakhand",
        "type": "State",
        "districts": [
            "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", 
            "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", 
            "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"
        ]
    },
    {
        "name": "West Bengal",
        "type": "State",
        "districts": [
            "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", 
            "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", 
            "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", 
            "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", 
            "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", 
            "Uttar Dinajpur"
        ]
    },
    # Union Territories
    {
        "name": "Andaman and Nicobar Islands",
        "type": "Union Territory",
        "districts": [
            "Nicobar", "North and Middle Andaman", "South Andaman"
        ]
    },
    {
        "name": "Chandigarh",
        "type": "Union Territory",
        "districts": [
            "Chandigarh"
        ]
    },
    {
        "name": "Dadra and Nagar Haveli and Daman and Diu",
        "type": "Union Territory",
        "districts": [
            "Dadra and Nagar Haveli", "Daman", "Diu"
        ]
    },
    {
        "name": "Delhi",
        "type": "Union Territory",
        "districts": [
            "Central Delhi", "East Delhi", "New Delhi", "North Delhi", 
            "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", 
            "South East Delhi", "South West Delhi", "West Delhi"
        ]
    },
    {
        "name": "Jammu and Kashmir",
        "type": "Union Territory",
        "districts": [
            "Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", 
            "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", 
            "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", 
            "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"
        ]
    },
    {
        "name": "Ladakh",
        "type": "Union Territory",
        "districts": [
            "Kargil", "Leh"
        ]
    },
    {
        "name": "Lakshadweep",
        "type": "Union Territory",
        "districts": [
            "Lakshadweep"
        ]
    },
    {
        "name": "Puducherry",
        "type": "Union Territory",
        "districts": [
            "Karaikal", "Mahe", "Puducherry", "Yanam"
        ]
    }
]

# Generate deterministic stable UUIDs for each state & district
STATES_MAP = {}
DISTRICTS_MAP = {}
STATE_DISTRICT_MAP = {}

# Pre-populate indexed maps
for s_idx, state_data in enumerate(sorted(INDIA_STATES_AND_DISTRICTS, key=lambda x: x["name"])):
    s_slug = f"state-{slugify(state_data['name'])}"
    s_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"state.shwf.{state_data['name']}"))
    state_obj = {
        "id": s_slug,
        "name": state_data["name"],
        "type": state_data["type"]
    }
    STATES_MAP[s_slug] = state_obj
    STATES_MAP[s_uuid] = state_obj
    STATES_MAP[state_data["name"].lower()] = state_obj

    dist_list = []
    for d_idx, d_name in enumerate(sorted(state_data["districts"])):
        d_slug = f"dist-{slugify(state_data['name'])}-{slugify(d_name)}"
        d_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"district.shwf.{state_data['name']}.{d_name}"))
        dist_obj = {
            "id": d_slug,
            "state_id": s_slug,
            "name": d_name
        }
        DISTRICTS_MAP[d_slug] = dist_obj
        DISTRICTS_MAP[d_uuid] = dist_obj
        DISTRICTS_MAP[d_name.lower()] = dist_obj
        dist_list.append(dist_obj)

    STATE_DISTRICT_MAP[s_slug] = dist_list
    STATE_DISTRICT_MAP[s_uuid] = dist_list
    STATE_DISTRICT_MAP[state_data["name"].lower()] = dist_list

def get_all_india_states():
    """Return all 36 States & UTs sorted alphabetically."""
    # Deduplicate unique state objects
    seen = set()
    unique_states = []
    for s in STATES_MAP.values():
        if s["name"] not in seen:
            seen.add(s["name"])
            unique_states.append(s)
    return sorted(unique_states, key=lambda x: x["name"])

def get_india_districts_by_state(state_id: str):
    """Return districts for a given state ID, slug, UUID, or name."""
    if not state_id:
        return []
    
    clean_id = state_id.strip().lower()
    if clean_id in STATE_DISTRICT_MAP:
        return STATE_DISTRICT_MAP[clean_id]
    
    # Try slugifying
    slug_id = f"state-{slugify(state_id)}"
    if slug_id in STATE_DISTRICT_MAP:
        return STATE_DISTRICT_MAP[slug_id]
        
    return []

def get_mock_schools_for_district(district_id: str):
    """Generate default partner schools for any given district."""
    dist_obj = DISTRICTS_MAP.get(district_id)
    dist_name = dist_obj["name"] if dist_obj else "District"
    
    code_prefix = slugify(dist_name)[:4].upper()
    return [
        {
            "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, f"school.{district_id}.1")),
            "district_id": district_id,
            "name": f"St. Xavier Public School, {dist_name}",
            "school_code": f"{code_prefix}01"
        },
        {
            "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, f"school.{district_id}.2")),
            "district_id": district_id,
            "name": f"Government Model High School, {dist_name}",
            "school_code": f"{code_prefix}02"
        },
        {
            "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, f"school.{district_id}.3")),
            "district_id": district_id,
            "name": f"Delhi Public School, {dist_name}",
            "school_code": f"{code_prefix}03"
        }
    ]

def get_mock_students_for_school(school_id: str, query: str = ""):
    """Generate sample student records for student search and OTP demonstration."""
    sample_students = [
        {
            "id": "d0000000-0000-0000-0000-000000000001",
            "student_id": "STD-2026-001",
            "full_name": "Aarav Sharma",
            "school_id": school_id,
            "school_name": "Partner School",
            "parent_name": "Rajesh Sharma",
            "parent_phone": "+919876543210"
        },
        {
            "id": "d0000000-0000-0000-0000-000000000002",
            "student_id": "STD-2026-002",
            "full_name": "Ananya Patel",
            "school_id": school_id,
            "school_name": "Partner School",
            "parent_name": "Meera Patel",
            "parent_phone": "09812345678"
        },
        {
            "id": "d0000000-0000-0000-0000-000000000003",
            "student_id": "STD-2026-003",
            "full_name": "Rohan Verma",
            "school_id": school_id,
            "school_name": "Partner School",
            "parent_name": "Suresh Verma",
            "parent_phone": "09876543210"
        },
        {
            "id": "d0000000-0000-0000-0000-000000000004",
            "student_id": "STD-2026-004",
            "full_name": "Pooja Reddy",
            "school_id": school_id,
            "school_name": "Partner School",
            "parent_name": "Kiran Reddy",
            "parent_phone": "+919988776655"
        },
        {
            "id": "d0000000-0000-0000-0000-000000000005",
            "student_id": "STD-2026-005",
            "full_name": "Vikram Singh",
            "school_id": school_id,
            "school_name": "Partner School",
            "parent_name": "Hardeep Singh",
            "parent_phone": "+919123456780"
        }
    ]
    if query:
        q = query.lower().strip()
        return [s for s in sample_students if q in s["full_name"].lower() or q in s["student_id"].lower()]
    return sample_students
