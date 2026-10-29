"""Varsayılan soru kütüphanesi ve genel şablon (yalnız hiç soru yoksa yazılır).

Sorular yalnız İŞ İÇİN GEREKLİ operasyonel ön bilgidir; korunan/ilgisiz
kişisel özellik (yaş, medeni durum, sağlık, din, köken...) SORULMAZ.
Metinlerdeki {otel} ve {pozisyon} görüşme anında başvurunun bağlamıyla
doldurulur.
"""
from datetime import datetime, timezone

import models

DEFAULT_QUESTIONS = [
    dict(field_key="employment_status", category="employment", answer_type="choice",
         question_text="Şu anda bir işte çalışıyor musunuz?",
         options=[{"value": "employed", "label": "Çalışıyor",
                   "synonyms": ["çalışıyorum", "çalışmaktayım", "işim var", "aktif olarak çalışıyorum", "evet çalışıyorum"]},
                  {"value": "unemployed", "label": "Çalışmıyor",
                   "synonyms": ["çalışmıyorum", "işsizim", "boştayım", "boşta", "işim yok", "ayrıldım", "hayır çalışmıyorum"]},
                  {"value": "student", "label": "Öğrenci", "synonyms": ["öğrenciyim", "okuyorum", "öğrenci"]}],
         max_clarifications=1),
    dict(field_key="notice_period", category="notice", answer_type="text", is_required=False,
         question_text="Mevcut işinizden ayrılmanız için bir ihbar süreniz var mı? Varsa ne kadar?",
         condition={"field": "employment_status", "op": "eq", "value": "employed"}, max_clarifications=0),
    dict(field_key="earliest_start_date", category="start_date", answer_type="date",
         question_text="En erken ne zaman işe başlayabilirsiniz?",
         validation={"future_only": True, "max_days_ahead": 365}, max_clarifications=1, confirm_existing=True),
    dict(field_key="shift_availability", category="shift", answer_type="multi_choice",
         question_text="Hangi vardiyalarda çalışabilirsiniz? Sabah, akşam, gece ya da dönüşümlü vardiya olabilir.",
         options=[{"value": "morning", "label": "Sabah", "synonyms": ["sabah", "sabahçı", "gündüz"]},
                  {"value": "evening", "label": "Akşam", "synonyms": ["akşam", "öğleden sonra", "akşamcı"]},
                  {"value": "night", "label": "Gece", "synonyms": ["gece", "gececi", "gece vardiyası"]},
                  {"value": "rotating", "label": "Dönüşümlü",
                   "synonyms": ["dönüşümlü", "rotasyonlu", "değişken", "vardiyalı", "karışık"]}],
         max_clarifications=1),
    dict(field_key="weekend_availability", category="weekend", answer_type="boolean",
         question_text="Hafta sonları çalışmanız mümkün mü?", max_clarifications=1),
    dict(field_key="location_availability", category="location", answer_type="boolean",
         question_text="{otel} lokasyonunda çalışmanız sizin için uygun mu?", max_clarifications=1),
    dict(field_key="accommodation_needed", category="accommodation", answer_type="boolean",
         question_text="Lojman, yani konaklama ihtiyacınız olur mu?", max_clarifications=1, confirm_existing=True),
    dict(field_key="transportation_needed", category="transportation", answer_type="boolean",
         question_text="İşe gelip gitmek için servis ihtiyacınız olur mu?", max_clarifications=1),
    dict(field_key="experience_duration", category="experience", answer_type="duration",
         question_text="{pozisyon} veya benzer bir görevde toplam ne kadar deneyiminiz var?",
         validation={"max_months": 600}, max_clarifications=1),
    dict(field_key="languages", category="language", answer_type="language_list", is_required=False,
         question_text="Hangi yabancı dilleri konuşuyorsunuz ve seviyenizi nasıl tanımlarsınız?",
         help_text="Adayın kendi beyanıdır; dil testi değildir.", max_clarifications=1),
    dict(field_key="certificates", category="certificate", answer_type="boolean", is_required=False,
         question_text="Bu pozisyon için gereken belge ya da sertifikalarınız, örneğin hijyen belgesi, var mı?",
         max_clarifications=1),
    dict(field_key="interview_preference", category="interview_scheduling", answer_type="text", is_required=False,
         question_text="İK ekibiyle görüşme için hangi gün ve saatler size uygun olur?", max_clarifications=0),
]

CATEGORIES = {
    "employment": "Mevcut çalışma durumu", "notice": "İhbar süresi", "start_date": "En erken başlama tarihi", "shift": "Vardiya uygunluğu",
    "weekend": "Hafta sonu uygunluğu", "location": "Otel / lokasyon uygunluğu", "accommodation": "Lojman ihtiyacı",
    "transportation": "Ulaşım ihtiyacı", "experience": "İlgili deneyim süresi", "language": "Dil bilgisi (beyan)",
    "certificate": "Gerekli belge / sertifika", "interview_scheduling": "İK görüşmesi tercihi",
    "other": "Onaylı diğer operasyonel soru",
}


def ensure_defaults(db) -> None:
    """Soru kütüphanesi boşsa varsayılanları ve yayımlanmış genel şablonu yazar."""
    if db.query(models.ScreeningQuestion.id).first() is not None:
        return
    now = datetime.now(timezone.utc)
    questions = []
    for spec in DEFAULT_QUESTIONS:
        q = models.ScreeningQuestion(version=1, status="published", published_at=now,
                                     **{"is_required": True, **spec})
        db.add(q)
        questions.append(q)
    db.flush()
    tpl = models.ScreeningTemplate(template_key="genel", version=1, status="published", name="Genel ön görüşme",
                                   description="Tüm oteller ve pozisyonlar için varsayılan ön bilgi akışı.",
                                   published_at=now)
    db.add(tpl)
    db.flush()
    for i, q in enumerate(questions):
        db.add(models.ScreeningTemplateItem(template_id=tpl.id, question_id=q.id, sort_order=i))
    db.commit()
