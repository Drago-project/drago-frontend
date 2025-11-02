import React from "react";
import styles from "../styles/About.module.css"; 

// ✅ مسار الصورة الأولى
import dyslexiaImage from '../assets/dyslexia.png'; 

// ✅ مسار الصورة الثانية
import learningAffectImage from '../assets/Designer.png'; 

// 🛑 التصحيح النهائي: تم تغيير الامتداد من .jpg إلى .png
const dragoImagePath = new URL('../assets/Drago p.png', import.meta.url).href; 


const About = () => {
  return (
    <div className={styles.aboutContainer}>
      
      {/* 🌟 Section 1: What is Dyslexia */}
      <section className={styles.hero}>
        <div className={styles.textContent}>
          <h1 className={styles.title}>What is Dyslexia?</h1>
          <p className={styles.description}>
            Dyslexia is a learning difference that affects how the brain processes written language.
            It makes reading, writing, and spelling more challenging, but it doesn’t mean a child isn’t smart.
            Many people with dyslexia are very creative and have great problem-solving skills.
          </p>
        </div>

        <div className={styles.imageContainer}>
          <img
            src={dyslexiaImage}
            alt="صورة توضيحية عن عسر         القراءة ومهارات الإبداع وحل المشكلات"    
            className={styles.heroImage} 
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/600x400/008080/ffffff?text=Dyslexia+Info";
              e.currentTarget.onerror = null; 
            }}
          />
        </div>
      </section>

      {/* 🌟 Section 2: How It Affects Learning */}
      <section className={styles.hero}>
        <div className={styles.textContent}>
            <h1 className={styles.title}>How Does Dyslexia Affect Learning?</h1> 
            <p className={styles.description}>
              Children with dyslexia may confuse letters that look similar, read slowly, or have trouble spelling.
              They might need more time to understand written words, but with encouragement, patience, and the right
              techniques, they can learn and grow successfully.
            </p>
        </div>

        <div className={styles.imageContainer}>
          <img
            src={learningAffectImage} 
            alt="صورة توضيحية لتحديات عسر القراءة مثل الخلط بين الحروف والمساعدة من المعلمة"
            className={styles.heroImage}
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/600x400/800000/ffffff?text=Learning+Challenges";
              e.currentTarget.onerror = null; 
            }}
          />
        </div>
      </section>

      {/* 🌟 Section 3: How Our Games Help (التعديل هنا) */}
      <section className={styles.hero}>
        <div className={styles.textContent}>
            <h1 className={styles.title}>How Our Games Help</h1> 
            <p className={styles.description}>
              Our educational games use sound, color, and motion to make reading and memory exercises more fun.
              They help children strengthen their focus, recognize words, and build confidence step by step.
              Learning through play helps children enjoy the process instead of feeling stressed or judged.
            </p>
        </div>
        <div className={styles.imageContainer}>
          <img
            src={dragoImagePath} // ⬅️ يستخدم المسار المصحح
            alt="Educational games illustration featuring Drago"
            className={styles.heroImage} 
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/600x400/1f2937/ffffff?text=Drago+Games";
              e.currentTarget.onerror = null; 
            }}
          />
        </div>
      </section>
      
      <footer className={styles.footer}>
        <p>Together, we can make learning fun for every child ❤️</p>
      </footer>
    </div> 
  );
};

export default About;