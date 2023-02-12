import { useState } from "react";
import { NavBar } from "./components/Navbar";
import { CreateSale, ViewSales } from "./components/SalesComponents";
import { useEth } from "./contexts/EthContext";

import "./style/normalize.css";
import "./style/style.css";

function App() {
  const { state } = useEth();
  const [seller, setSeller] = useState(true);

  function switchSeller() {
    console.log("switching seller");
    setSeller(!seller);
  }

  return (
    <div id="App">
      <NavBar switchTheSeller={switchSeller} />

      <>
        {state.accounts?.length > 0 && (
          <>
            <i
              style={{
                wordBreak: "break-all",
              }}
            >
              Connected to {state.accounts[0]}
            </i>
            <ViewSales usersAddress={state.accounts[0]} isSeller={seller} />
            <CreateSale usersAddress={state.accounts[0]} />
          </>
        )}
        <p>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Libero
          commodi blanditiis maiores illum. Fugit sint, exercitationem quod
          voluptatem necessitatibus consectetur alias, odio iure adipisci hic
          amet et nemo aperiam possimus ex doloremque. Placeat possimus velit
          iste nihil cupiditate illum eius sequi esse soluta totam, odit cumque
          nisi eveniet. Hic, dolore nostrum. Enim illum eaque doloremque magnam
          aut at, explicabo neque, nostrum sequi commodi reiciendis quibusdam
          ipsum veniam porro ullam in omnis ipsam pariatur alias animi nesciunt
          accusamus. Voluptates nostrum accusamus dicta sequi nobis quasi fuga
          facilis, harum, fugiat sunt, ea laboriosam quam pariatur temporibus.
          Excepturi vel harum eius delectus voluptas error incidunt, corrupti,
          totam deleniti dolore et vitae temporibus iure. Reiciendis minus
          mollitia nobis a beatae optio, illum libero cum reprehenderit ullam
          cumque et expedita eaque, incidunt voluptates unde earum soluta. Sequi
          illum consequatur temporibus! Odit quod, officia atque doloribus
          reiciendis repellat, omnis, iure molestiae eos harum odio? Iste
          officiis ullam eum error adipisci ipsum amet, molestias ducimus
          perspiciatis expedita sequi omnis, quia eveniet itaque nesciunt cum!
          Odit sed neque deserunt ipsam commodi iste necessitatibus dignissimos,
          ab odio nisi, quas ratione beatae! Labore iste dicta, fugit cumque
          eaque non natus incidunt voluptates dolores voluptatem mollitia
          dolorum! Consequatur, tenetur odio. Non totam dolores, mollitia nulla
          tempore tempora libero cupiditate rem deserunt perferendis repellat
          optio nam rerum porro et possimus, necessitatibus harum blanditiis
          officia nemo asperiores dignissimos corporis. Inventore quod repellat,
          amet ipsam nisi rerum! Vel dolores, sapiente a reprehenderit adipisci
          omnis, magni optio fuga accusamus eaque beatae commodi ducimus
          nesciunt neque minus fugit labore quis quidem facilis laborum officia
          explicabo. Atque sint voluptate omnis, molestiae nisi numquam quae
          labore tempora ipsam itaque odio laborum laboriosam! Aut doloremque
          quibusdam officiis sit assumenda provident quas expedita quod itaque
          modi corporis nemo numquam dolor tempora iste dicta, non ipsa ab fuga
          veniam aliquam! Illum cupiditate est voluptatem, facere totam aliquam
          aspernatur aliquid nam tempora tempore adipisci optio consequuntur
          iste neque eligendi at aut consequatur, esse fuga itaque sint
          temporibus non? Quos, error? Consequatur earum molestiae voluptas
          quidem esse quod? Facere, at ullam harum repudiandae earum eligendi
          dignissimos tenetur doloribus beatae quibusdam nisi totam nulla
          suscipit placeat magni voluptatum ipsum! Et, optio alias odit, aperiam
          officia laborum provident animi veritatis ea mollitia id, dignissimos
          nam dolorum recusandae rerum itaque maiores reiciendis consequuntur
          omnis sequi unde magnam amet dolores hic. Architecto molestiae a
          dolore rerum quo, magni eos aspernatur voluptate aperiam sed, nesciunt
          harum corrupti, dolor enim obcaecati perferendis. Aspernatur
          asperiores eaque soluta voluptatem, laborum repellendus nihil
          laudantium vero id tempora possimus tenetur officia in aut debitis ab
          sint culpa perspiciatis ullam quod aliquam voluptate! Nobis nostrum
          dicta beatae at. Veritatis, animi natus blanditiis repellendus
          deserunt est amet numquam quae odit quisquam omnis, repellat
          repudiandae, reiciendis labore itaque quam a. Nisi, officia fugiat
          aperiam unde reiciendis, perferendis atque aliquam ipsum aut amet
          itaque iusto vel, quo suscipit quibusdam? Voluptates, dolor quam
          ducimus fugiat facilis maiores sit autem molestiae dicta ea voluptate
          consectetur saepe quia inventore voluptatem sapiente alias quasi
          praesentium aliquid nesciunt quas nemo. Saepe ratione nihil nemo odio
          deleniti commodi, doloribus praesentium dolores necessitatibus
          aspernatur perspiciatis ea natus eos. Odio repudiandae veritatis qui
          nemo, exercitationem accusamus harum cumque nulla inventore sit
          cupiditate. Sunt perferendis expedita vero. Aliquam, quisquam placeat
          nam quas corporis tenetur sint! Illo earum deleniti, ex perferendis
          nam veritatis! Vitae excepturi numquam dolorem laboriosam soluta
          veritatis fugit quae magni nulla aliquam, ab in, vel odio mollitia
          voluptates illum blanditiis magnam, odit ipsa temporibus perferendis
          aspernatur? Accusantium doloremque accusamus deserunt voluptatem
          facere repellat nemo suscipit beatae asperiores quas, recusandae
          debitis mollitia officia culpa repudiandae tenetur veniam ipsam vel
          autem vero obcaecati corrupti aliquam magnam? Pariatur placeat
          architecto veniam ducimus vel porro, corrupti minus, quaerat voluptate
          exercitationem, aspernatur qui libero eum deleniti suscipit illo non
          deserunt voluptatum nisi! Eveniet, voluptatibus voluptatem. Deleniti
          fugit asperiores odio fuga temporibus perspiciatis esse modi eveniet!
          Illum iure quasi, labore quos, voluptates enim officia sequi
          cupiditate culpa animi doloribus eveniet repudiandae perspiciatis unde
          provident minima non dolores debitis alias ullam. Magnam totam ipsum,
          asperiores voluptas tenetur repellat provident dolor dolore
          perspiciatis sequi eius sapiente recusandae voluptate nesciunt
          corporis quos, ab quis corrupti sit perferendis molestias odit epe
          velit, quod voluptates necessitatibus repellat! Omnis libero natus
          dicta veritatis modi, vitae et sunt voluptas!
        </p>
      </>
    </div>
  );
}

export default App;
