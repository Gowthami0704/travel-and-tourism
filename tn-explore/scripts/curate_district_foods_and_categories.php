<?php
/**
 * Script: curate_district_foods_and_categories.php
 * Curates authentic regional culinary heritage dishes and refines place categorizations across all 38 districts of Tamil Nadu.
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\District;
use App\Models\Place;
use App\Models\FoodDish;
use Illuminate\Support\Facades\DB;

echo "=================================================================\n";
echo "TAMIL NADU TOURISM: CURATING FOOD DISHES & PLACE CATEGORIES\n";
echo "=================================================================\n\n";

// 1. Authentic Regional Specialties per District
$districtFoods = [
    'Ariyalur' => [
        ['name' => 'Varagu Millet Sadam with Kollu Rasam', 'veg' => true, 'desc' => 'Traditional nutritious Kodo millet lunch served with aromatic horsegram rasam and native greens.'],
        ['name' => 'Cashew Halwa & Roasted Cashews', 'veg' => true, 'desc' => 'Rich locally grown Cashewnut ghee halwa and slow-roasted masala cashews from the Jayankondam cashew belt.'],
        ['name' => 'Palm Jaggery Karupatti Paniyaram', 'veg' => true, 'desc' => 'Crisp shallow-fried sweet dumplings made with stone-ground raw rice and pure natural palm jaggery.']
    ],
    'Chengalpattu' => [
        ['name' => 'Mahabalipuram Butter Garlic Prawns', 'veg' => false, 'desc' => 'Fresh Bay of Bengal catch tossed in garlic, cracked pepper, and coastal herbs.'],
        ['name' => 'Pallavaram Masala Vadai & Chai', 'veg' => true, 'desc' => 'Crisp, herb-laden crunchy Bengal gram lentil vadai served with hot ginger tea.'],
        ['name' => 'Edayur Mango Lassi & Kulfi', 'veg' => true, 'desc' => 'Creamy dessert made from sun-ripened local Banganapalli and Neelam mangoes.']
    ],
    'Chennai' => [
        ['name' => 'Madras Filter Coffee & Ghee Pongal', 'veg' => true, 'desc' => 'Steaming dark roast degree chicory-filtered brew paired with piping hot peppercorn ghee ven pongal.'],
        ['name' => 'Marina Beach Sundal & Raw Mango', 'veg' => true, 'desc' => 'Tender white chickpeas tossed with freshly grated coconut, raw sour mango slivers, mustard, and curry leaves.'],
        ['name' => 'Royapuram Seafood Fish Curry (Meen Kuzhambu)', 'veg' => false, 'desc' => 'Fiery, tamarind-infused traditional fisherman-style Vanjaram seer fish gravy simmered in earthen clay pots.'],
        ['name' => 'Sowcarpet Murukku Sandwich & Kesar Kulfi', 'veg' => true, 'desc' => 'Iconic North Madras street delicacy topped with mint chutney, cucumbers, tomatoes, and spicy sev.'],
        ['name' => 'Burmese Atho & Mohinga (George Town)', 'veg' => true, 'desc' => 'Spicy wok-tossed garlic Burmese noodles seasoned with fried onions, cabbage, tamarind juice, and crisp plantain crisps.']
    ],
    'Coimbatore' => [
        ['name' => 'Annapoorna Ghee Sambar Mini Idli', 'veg' => true, 'desc' => 'Button idlis drenched in the legendary Kongunadu proprietary spice blend sambar and pure clarified butter.'],
        ['name' => 'Arisi Paruppu Sadam with Ghee', 'veg' => true, 'desc' => 'The ultimate Kongu comfort meal — fragrant short-grain rice and toor dal cooked together with shallots and cumin.'],
        ['name' => 'Pallipalayam Chicken Fry', 'veg' => false, 'desc' => 'Succulent country chicken roasted with shallots, dried red chillies, and fresh grated coconut ribbons.'],
        ['name' => 'Elaneer (Tender Coconut) Payasam', 'veg' => true, 'desc' => 'Chilled silky dessert made with fresh Pollachi coconut pulp, coconut milk, and cardamom condensed milk.']
    ],
    'Cuddalore' => [
        ['name' => 'Chidambaram Kathirikai Gothsu with Idiyappam', 'veg' => true, 'desc' => 'Char-roasted mashed brinjal spiced stew served alongside steamed delicate rice string hoppers.'],
        ['name' => 'Cuddalore Coastal Crab Roast', 'veg' => false, 'desc' => 'Mud crabs pan-roasted in black pepper, shallots, curry leaves, and spicy coastal coastal masala.'],
        ['name' => 'Neyveli Cashew Cake & Pakoda', 'veg' => true, 'desc' => 'Delicate melt-in-the-mouth sweet cake crafted from freshly harvested Neyveli cashewnuts.']
    ],
    'Dharmapuri' => [
        ['name' => 'Kambu Koozh with Raw Onion & Mor Milagai', 'veg' => true, 'desc' => 'Fermented pearl millet summer porridge served with cool spiced buttermilk, small shallots, and sun-dried curd chillies.'],
        ['name' => 'Nattu Kozhi Uppu Kari (Country Chicken Salt Pepper Fry)', 'veg' => false, 'desc' => 'Rustic village preparation of tender free-range chicken stir-fried with simple rock salt, dry chillies, and sesame oil.'],
        ['name' => 'Hogenakkal Fresh Fish Fry & Curry', 'veg' => false, 'desc' => 'River Katla and Rogu fish fresh from the Cauvery river, marinated in red chilli paste and crisp deep-fried on the riverbank.']
    ],
    'Dindigul' => [
        ['name' => 'Dindigul Thalappakatti Mutton Dum Biryani', 'veg' => false, 'desc' => 'World-renowned Seeraga Samba short grain rice biryani layered with tender grass-fed baby goat meat and stone-ground spices.'],
        ['name' => 'Natham Milk Peda', 'veg' => true, 'desc' => 'Rich caramelized whole-milk confection simmered for hours in heavy brass vats until golden and creamy.'],
        ['name' => 'Sirumalai Hill Banana with Honey', 'veg' => true, 'desc' => 'Naturally sweet organic GI-tagged wild hill bananas drizzled with forest honey.']
    ],
    'Erode' => [
        ['name' => 'Bhavani Kambu Thattu Vadai Set', 'veg' => true, 'desc' => 'Crisp millet crisps layered with freshly grated beetroot, carrots, spicy shallot paste, and tangy lemon juice.'],
        ['name' => 'Erode Nattu Kozhi Chinthamani', 'veg' => false, 'desc' => 'Spicy dry chicken dish crafted with only three key ingredients: country chicken, round Gundu chillies, and gingelly oil.'],
        ['name' => 'Kodumudi Paruthi Paal (Cottonseed Milk Halwa Drink)', 'veg' => true, 'desc' => 'Wholesome nutritious warm beverage brewed from extracted cottonseed milk, raw palm sugar, dry ginger, and coconut.']
    ],
    'Kallakurichi' => [
        ['name' => 'Samai & Thinai Millet Adai with Avial', 'veg' => true, 'desc' => 'Nutrient-rich multigrain lentil crepes served with Kerala-style mixed vegetable coconut stew.'],
        ['name' => 'Kalrayan Hills Forest Honey Sweets', 'veg' => true, 'desc' => 'Sweet delicacy made with pure unpasteurized tribal wild bee honey from the Kalrayan mountain forests.']
    ],
    'Kancheepuram' => [
        ['name' => 'Authentic Kanchipuram Kovil Idli', 'veg' => true, 'desc' => 'Traditional cylindrical temple prasadam idli spiced with crushed pepper, cumin, dry ginger powder, and roasted cashews.'],
        ['name' => 'Kanchi Badam Halwa & Ghee Poli', 'veg' => true, 'desc' => 'Rich sweet almond halwa and warm sweet coconut-lentil stuffed pan-grilled breads drenched in pure cow ghee.']
    ],
    'Kanniyakumari' => [
        ['name' => 'Nanjil Country Fish Curry with Tapioca', 'veg' => false, 'desc' => 'Traditional southern coastal fish curry with ground coconut and raw mango, eaten with steamed tapioca tubers.'],
        ['name' => 'Pazha Bajji & Spicy Coconut Chutney', 'veg' => true, 'desc' => 'Ripe sweet Nendran plantain slices dipped in gram flour batter and golden deep-fried.'],
        ['name' => 'Ulundhu Kali with Karupatti Ghee', 'veg' => true, 'desc' => 'Traditional postpartum strengthening dessert made of black gram, palm jaggery, and sesame oil.']
    ],
    'Karur' => [
        ['name' => 'Karur Ghee Paniyaram with Coconut Chutney', 'veg' => true, 'desc' => 'Crisp on the outside, fluffy on the inside fermented rice batter dumplings tossed in golden ghee.'],
        ['name' => 'Amaravathi River Fish Masala', 'veg' => false, 'desc' => 'Freshwater catch prepared in traditional earthen cookware with homegrown turmeric and coriander spices.']
    ],
    'Krishnagiri' => [
        ['name' => 'Krishnagiri Mango Malpua & Payasam', 'veg' => true, 'desc' => 'Rich festive dessert celebrating India’s top mango harvest orchards with saffron condensed milk.'],
        ['name' => 'Rayakottai Ragi Roti with Kollu Chutney', 'veg' => true, 'desc' => 'Warm finger-millet flatbreads stuffed with onions, drumstick leaves, and served with spicy horsegram relish.']
    ],
    'Madurai' => [
        ['name' => 'Famous Madurai Special Jigarthanda', 'veg' => true, 'desc' => 'Legendary royal refreshing drink prepared with badam pisin (almond resin), condensed milk, basundi, and nannari syrup.'],
        ['name' => 'Madurai Kari Dosa (Minced Mutton / Chicken Layer Dosa)', 'veg' => false, 'desc' => 'Three-tier thick pan pancake layered with plain batter, beaten egg, and spicy cooked minced meat gravy.'],
        ['name' => 'Madurai Fluffy Bun Parotta with Salna', 'veg' => false, 'desc' => 'Crisp multi-layered flaky bun-shaped parottas served with rich spicy roadside roadside salna gravy.'],
        ['name' => 'Murugan Idli with Four Specialty Chutneys', 'veg' => true, 'desc' => 'Feather-soft steamed jasmine rice idlis paired with tomato, mint, coriander, and spicy podi ghee.'],
        ['name' => 'Madurai Paruthi Paal & Mutton Chukka', 'veg' => false, 'desc' => 'Spicy dry roasted mutton pieces coated with peppercorns, followed by soothing hot herbal cottonseed milk.']
    ],
    'Mayiladuthurai' => [
        ['name' => 'Kaveri River Fish Varuval (Meen Fry)', 'veg' => false, 'desc' => 'Delta fish fried with home-ground red chilli masala and curry leaves.'],
        ['name' => 'Tharangambadi Seafood Crab Thokku', 'veg' => false, 'desc' => 'Fresh Danish-heritage coastline mud crabs cooked in thick spicy onion-tomato reduction.']
    ],
    'Nagapattinam' => [
        ['name' => 'Nagore Dumroot Halwa', 'veg' => true, 'desc' => 'Historic semolina, ghee, khoya, and cashew baked halwa with a caramelized golden crust.'],
        ['name' => 'Velankanni Coastal Prawn Masala', 'veg' => false, 'desc' => 'Succulent coastal prawns tossed with cracked black pepper and south-coastal shallot gravy.']
    ],
    'Namakkal' => [
        ['name' => 'Namakkal Egg Kothu Parotta', 'veg' => false, 'desc' => 'Shredded parotta tossed on high flame with eggs, shallots, green chillies, and piping hot chicken salna.'],
        ['name' => 'Kolli Hills Pepper Chicken & Herbal Tea', 'veg' => false, 'desc' => 'Country chicken roasted with organic GI-certified wild black pepper from Kolli Hills.'],
        ['name' => 'Tiruchengode Elaneer Payasam', 'veg' => true, 'desc' => 'Velvety tender coconut milk dessert flavored with green cardamom and cashews.']
    ],
    'Nilgiris' => [
        ['name' => 'Ooty Handmade Gourmet Chocolates', 'veg' => true, 'desc' => 'Artisanal dark, white, and roasted almond fudge chocolates crafted by Ooty master chocolatiers.'],
        ['name' => 'Crisp Ooty Varkey with Nilgiri Golden Orange Pekoe Tea', 'veg' => true, 'desc' => 'Crunchy, flaky baked crust pastry dipped into steaming freshly brewed single-estate Nilgiri black tea.'],
        ['name' => 'Badaga Traditional Ragi Kali & Avarai Kozhambu', 'veg' => true, 'desc' => 'Indigenous hill tribe comfort food with steamed finger-millet balls and broad bean curry.'],
        ['name' => 'Ketti Valley Sweet Carrot Halwa', 'veg' => true, 'desc' => 'Rich dessert made with fresh Nilgiri red mountain carrots, ghee, and pistachios.']
    ],
    'Perambalur' => [
        ['name' => 'Shallot Sambhar Vadai (Chinna Vengayam)', 'veg' => true, 'desc' => 'Crispy lentil vada soaked in sweet, rich small shallot sambar from the shallot capital of Tamil Nadu.'],
        ['name' => 'Ragi Puttu with Grated Coconut & Country Sugar', 'veg' => true, 'desc' => 'Steamed finger-millet cylinders layered with coconut and unrefined cane sugar.']
    ],
    'Pudukkottai' => [
        ['name' => 'Pudukkottai Ennai Parotta with Mutton Salna', 'veg' => false, 'desc' => 'Ultra-crispy deep-fried layered flatbreads served with rich spiced mutton gravy.'],
        ['name' => 'Viralimalai Karupatti Mittai', 'veg' => true, 'desc' => 'Crisp deep-fried gram flour coils drenched in pure dark palm jaggery syrup.']
    ],
    'Ramanathapuram' => [
        ['name' => 'Rameswaram Seaweed Halwa (Kadal Paasi)', 'veg' => true, 'desc' => 'Refreshing ocean-plant gelatin agar agar dessert infused with cardamom and almond essence.'],
        ['name' => 'Ramnad Gundu Chilli Fish Roast', 'veg' => false, 'desc' => 'Fresh catch coated in the iconic pungent Ramnad spherical red chilli paste and pan-roasted on cast iron.'],
        ['name' => 'Dhanushkodi Crab Curry & Steamed Rice', 'veg' => false, 'desc' => 'Island fisherman-style coconut and tamarind crab curry cooked on driftwood fire.']
    ],
    'Ranipet' => [
        ['name' => 'Arcot Makkan Peda', 'veg' => true, 'desc' => 'Royal Nawab sweet prepared from reduced milk mawa dough stuffed with dry fruits and soaked in sugar saffron syrup.'],
        ['name' => 'Ranipet Boti & Kheema Dosa', 'veg' => false, 'desc' => 'Crispy thin rice crepe stuffed with spiced minced meat and served with piquant gravy.']
    ],
    'Salem' => [
        ['name' => 'Salem Iconic Thattu Vadai Set', 'veg' => true, 'desc' => 'Crunchy rice-dal crackers stuffed with spiced beetroot, grated carrot, and fiery ginger-garlic chutney.'],
        ['name' => 'Salem Malgova Mango Payasam & Cream', 'veg' => true, 'desc' => 'Decadent dessert celebrating Salem’s queen of mangoes with rich thickened condensed milk.'],
        ['name' => 'Yercaud Hill Pepper Mutton Chukka', 'veg' => false, 'desc' => 'Dry spiced mutton cubes tossed with organic Shevaroy mountain black pepper and shallots.']
    ],
    'Sivaganga' => [
        ['name' => 'Chettinad Kozhi Varuval (Spicy Pepper Chicken)', 'veg' => false, 'desc' => 'World-famous authentic Chettinad preparation roasted with 18 freshly ground stone spices.'],
        ['name' => 'Chettinad Vellai Paniyaram with Kara Chutney', 'veg' => true, 'desc' => 'Silky smooth melt-in-the-mouth shallow-fried rice & urad dal dumplings with piquant tomato relish.'],
        ['name' => 'Chettinad Kandharappam & Seeyam', 'veg' => true, 'desc' => 'Traditional festive sweet made from rice, lentils, coconut, and jaggery fried to golden perfection.'],
        ['name' => 'Karaikudi Meen Mandi & Rice', 'veg' => false, 'desc' => 'Piquant okra, shallot, and rice-water stew cooked with fresh fish in traditional earthen clay pots.']
    ],
    'Tenkasi' => [
        ['name' => 'Courtallam Border Parotta & Pepper Naatu Kozhi', 'veg' => false, 'desc' => 'Legendary Border Rahmath style crispy paper-thin parottas served with spicy pepper dry country chicken.'],
        ['name' => 'Tenkasi Halwa with Ghee & Cashews', 'veg' => true, 'desc' => 'Silky soft wheat milk sweet cooked in brass karahis with pure ghee and mountain spring water.']
    ],
    'Thanjavur' => [
        ['name' => 'Thanjavur Ashoka Halwa (Moong Dal & Ghee)', 'veg' => true, 'desc' => 'Velvety smooth golden halwa made of yellow moong lentils, wheat flour, pure cow ghee, and saffron.'],
        ['name' => 'Kumbakonam Degree Coffee', 'veg' => true, 'desc' => 'Rich, frothy South Indian filter coffee brewed with undiluted pure cow milk in traditional brass dabara-tumblers.'],
        ['name' => 'Kumbakonam Kadappa with Idli & Dosa', 'veg' => true, 'desc' => 'Mildly spiced, creamy yellow moong dal and potato stew seasoned with fennel, green chillies, and coconut paste.']
    ],
    'Theni' => [
        ['name' => 'Cumbum Valley Black Grape Juice & Sorbet', 'veg' => true, 'desc' => 'Naturally sweet fresh juice from the GI-tagged Cumbum Valley Muscat Hamburg black grapes.'],
        ['name' => 'Suruli Falls Herbal Soup & Nattu Kozhi', 'veg' => false, 'desc' => 'Warm therapeutic soup boiled with fresh Western Ghats medicinal wild herbs and free-range chicken.']
    ],
    'Thiruvallur' => [
        ['name' => 'Poondi Fish Fry with Curry Leaves', 'veg' => false, 'desc' => 'Fresh reservoir fish marinated with garlic, crushed cumin, and fried crisp in cold-pressed oil.'],
        ['name' => 'Tiruttani Kovil Panchamirtham & Laddu', 'veg' => true, 'desc' => 'Devotional sweet offering made of hill bananas, jaggery, honey, dates, and cardamom.']
    ],
    'Thiruvarur' => [
        ['name' => 'Mannargudi Senai Kizhangu Varuval & Sambhar', 'veg' => true, 'desc' => 'Pan-crisped elephant foot yam roasted with sambar spices paired with Thanjavur delta rice.'],
        ['name' => 'Muthupet Mud Crab Roast', 'veg' => false, 'desc' => 'Mangrove wetland crabs cooked in spicy black pepper, shallots, and fresh coconut paste.']
    ],
    'Thoothukudi' => [
        ['name' => 'Thoothukudi Cashewnut Macaroons', 'veg' => true, 'desc' => 'Feather-light crispy egg white and crushed cashew confections introduced by Portuguese traders.'],
        ['name' => 'Thoothukudi Poricha Parotta & Salna', 'veg' => false, 'desc' => 'Deep-fried golden parotta served with spicy rich meat salna and onion raita.'],
        ['name' => 'Karupatti Coffee (Palm Jaggery Brew)', 'veg' => true, 'desc' => 'Spiced filter coffee sweetened with unrefined mineral-rich black palm jaggery and dry ginger.']
    ],
    'Tiruchirappalli' => [
        ['name' => 'Manapparai Crunchy Murukku', 'veg' => true, 'desc' => 'World-famous ultra-crispy double-fried twisted rice savories kneaded with pure cow butter and omam (carom seeds).'],
        ['name' => 'Trichy Srirangam Puliyodharai (Tamarind Rice)', 'veg' => true, 'desc' => 'Temple-style fragrant rice tempered with gingelly oil, mustard, peanuts, red chillies, and spice blend.'],
        ['name' => 'Trichy Golden Banana Halwa (Poovan Pazham)', 'veg' => true, 'desc' => 'Chewy rich dark sweet cooked with native Trichy bananas, ghee, and cashew nuts.']
    ],
    'Tirunelveli' => [
        ['name' => 'Iruttu Kadai Wheat Halwa (Nellai Halwa)', 'veg' => true, 'desc' => 'Legendary melt-in-mouth dark golden halwa made from fermented wheat milk, pure ghee, and Thamirabarani river water.'],
        ['name' => 'Nellai Sodhi & Ginger Thuvaiyal', 'veg' => true, 'desc' => 'Creamy coconut milk vegetable stew served with hot rice and digestive spicy ginger-tamarind paste.'],
        ['name' => 'Nellai Nei Roast Dosa & Ulundhu Vadai', 'veg' => true, 'desc' => 'Ultra-crisp golden dosa basted in pure country ghee served with four distinctive chutneys.']
    ],
    'Tirupathur' => [
        ['name' => 'Ambur Star Mutton Dum Biryani', 'veg' => false, 'desc' => 'Nawabi-era Seeraga Samba mutton biryani with mild whole spices, tomatoes, curd, and sour Brinjal Kathirikai gravy.'],
        ['name' => 'Yelagiri Hill Forest Honey Pancakes', 'veg' => true, 'desc' => 'Fluffy pancakes drizzled with raw tribal forest honey and wild mountain berries.']
    ],
    'Tiruppur' => [
        ['name' => 'Uthukuli Famous Butter & Podi Dosa', 'veg' => true, 'desc' => 'Fresh churning from the butter capital of Tamil Nadu melting over piping hot gunpowder spiced dosa.'],
        ['name' => 'Dharapuram Pallipalayam Mutton Chukka', 'veg' => false, 'desc' => 'Mutton morsels cooked with shallots, dried chillies, and coconut slivers in cold-pressed groundnut oil.']
    ],
    'Tiruvannamalai' => [
        ['name' => 'Arunachaleswarar Kovil Ven Pongal & Ghee Sambhar', 'veg' => true, 'desc' => 'Piping hot sacred temple rice-lentil dish tempered with cumin, whole black peppercorns, cashews, and ghee.'],
        ['name' => 'Girivalam Herbal Tea & Kambu Paniyaram', 'veg' => true, 'desc' => 'Rejuvenating herbal concoction brewed for mountain circuit pilgrims with ginger, tulsi, and palm sugar.']
    ],
    'Vellore' => [
        ['name' => 'Vellore Brinjal Biryani Gravy (Ennai Kathirikai Gothsu)', 'veg' => true, 'desc' => 'Tender small brinjals simmered in ground peanut, sesame, tamarind, and coconut gravy.'],
        ['name' => 'Vellore Kaju Katli & Peda', 'veg' => true, 'desc' => 'Melt-in-mouth diamond cut cashew fudges made with pure saffron.'],
        ['name' => 'Vellore Fort Mutton Chukka & Sheermal', 'veg' => false, 'desc' => 'Tender pan-roasted spicy mutton served with soft cardamom-scented tandoor breads.']
    ],
    'Viluppuram' => [
        ['name' => 'Gingee Kambu Koozh with Dried Fish Gravy', 'veg' => false, 'desc' => 'Cool pearl millet beverage served with spicy dried fish gravy and raw onion salad.'],
        ['name' => 'Auroville Wood-Fired Organic Sourdough & Gelato', 'veg' => true, 'desc' => 'European-standard artisan whole-wheat bread and freshly churned seasonal fruit gelato.']
    ],
    'Virudhunagar' => [
        ['name' => 'Virudhunagar Ennai Poricha Parotta with Salna', 'veg' => false, 'desc' => 'Shallow-fried crispy parotta served with legendary spiced meat salna and onion raita.'],
        ['name' => 'Srivilliputhur Authentic Palkova', 'veg' => true, 'desc' => 'GI-tagged pure whole cow milk and sugar sweet slow-simmered for hours over wood fire until rich and fudge-like.'],
        ['name' => 'Sattur Crunchy Ribbon Sev & Murukku', 'veg' => true, 'desc' => 'Crispy gram flour ribbon strips spiced with asafoetida, crushed red chillies, and garlic.']
    ],
];

// 2. Clear old placeholder food dishes and re-seed authentic items
echo "Updating Food Dishes table...\n";
DB::table('food_dishes')->truncate();

$insertedFoods = 0;
$districts = District::all();

foreach ($districts as $d) {
    $dName = $d->name;
    $foods = $districtFoods[$dName] ?? [
        ['name' => "{$dName} Traditional Thali Meals", 'veg' => true, 'desc' => "Nutritious traditional meals with rice, sambar, rasam, kootu, poriyal, and crisp appalam."],
        ['name' => "{$dName} Special Ghee Dosa & Filter Coffee", 'veg' => true, 'desc' => "Crisp golden crepe roasted in cow ghee and served with fresh coconut chutney."]
    ];

    foreach ($foods as $f) {
        FoodDish::create([
            'district_id' => $d->id,
            'name' => $f['name'],
            'description' => $f['desc'],
            'is_veg' => $f['veg'],
            'price' => rand(60, 280),
            'rating' => round(4.5 + (rand(0, 4) / 10), 1),
            'image_url' => null, // Will be populated with real Wikimedia photo
        ]);
        $insertedFoods++;
    }
}
echo "✓ Successfully inserted {$insertedFoods} authentic regional dishes!\n\n";

// 3. Refine Place Categorization in Database
echo "Refining Place Categorization for 1,330 Places...\n";

$places = Place::all();
$categoryCounts = [];

foreach ($places as $p) {
    $nameLower = mb_strtolower($p->name);
    $descLower = mb_strtolower($p->description ?? '');
    $full = $nameLower . ' ' . $descLower;
    
    $newCategory = $p->category;

    // Beaches
    if (preg_match('/\b(beach|coast|shore|marina|sea|bay|cove|lighthouse)\b/i', $nameLower)) {
        $newCategory = 'beach';
    }
    // Hill stations / Viewpoints
    elseif (preg_match('/\b(ooty|kodaikanal|coonoor|yercaud|valparai|kolli\s*hills|meghamalai|yelagiri|javadi|shevaroy|peak|viewpoint|valley|tea\s*estate|botanical\s*garden|hill\s*station|hills)\b/i', $nameLower)) {
        $newCategory = 'hill_station';
    }
    // Temples & Religious
    elseif (preg_match('/\b(temple|kovil|koil|swamy|amman|perumal|shivan|murugan|vinayagar|eswarar|church|cathedral|basilica|dargah|mosque|shrine|matha)\b/i', $nameLower)) {
        $newCategory = 'temple';
    }
    // Forts, Palaces & Heritage
    elseif (preg_match('/\b(fort|palace|mahal|monument|memorial|ruins|cave|sculpture|heritage|chola|pallava|nayak|rock\s*cut)\b/i', $nameLower)) {
        $newCategory = 'heritage';
    }
    // Museums
    elseif (preg_match('/\b(museum|gallery|planetarium|science\s*centre|fossil|archaeological)\b/i', $nameLower)) {
        $newCategory = 'museum';
    }
    // Wildlife / Bird / Nature / Waterfalls / Lake / Dam
    elseif (preg_match('/\b(falls|waterfall|cascades?|aruvi|sanctuary|reserve|tiger|safari|forest|lake|dam|reservoir|wetland|mangrove|island)\b/i', $nameLower)) {
        $newCategory = 'nature';
    }
    // Parks & Gardens
    elseif (preg_match('/\b(park|garden|zoo|theme\s*park|amusement)\b/i', $nameLower)) {
        $newCategory = 'park';
    }

    if ($newCategory !== $p->category) {
        $p->category = $newCategory;
        $p->save();
    }

    $categoryCounts[$newCategory] = ($categoryCounts[$newCategory] ?? 0) + 1;
}

echo "Place Categories updated:\n";
foreach ($categoryCounts as $cat => $cnt) {
    echo "  - {$cat}: {$cnt} places\n";
}

echo "\nDone!\n";
