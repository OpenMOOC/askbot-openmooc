%define platform openmooc
%define component askbot
%define libname askbot%{platform}
%define version 0.0dev
%define release 1

Summary: Askbot openmooc integration like theme and saml2
Name: %{component}-%{platform}
Version: %{version}
Release: %{release}
Source0: %{name}-%{version}.tar.gz

Source1: askbot-openmooc.wsgi
Source2: askbot-openmooc.conf
Source3: local_settings.py
Source4: server.key
Source5: server.crt


License: Apache Software License
Group: Development/Libraries
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-buildroot
Prefix: %{_prefix}
BuildArch: noarch
Vendor: Rooter <info@rooter.es>
URL: https://github.com/OpenMOOC/askbot-openmooc
Requires: askbot = 0.7.44, python-djangosaml2 = 0.9.0, python-memcached
Requires: httpd, mod_wsgi, mod_ssl

%description
Askbot customizations for OpenMOOC
==================================

 * OpenMOOC theme
 * Specific Settings
 * SAML2 integration


%prep
%setup -n %{name}-%{version}

%build
%{__python} setup.py build

%install
%{__python} setup.py install -O1 --skip-build --root %{buildroot}


# Create directories

# /usr/share/doc/openmooc/askbot
install -d -m 755 %{buildroot}/%{_defaultdocdir}/%{platform}/askbot

# /etc/openmooc/askbot
install -d -m 755 %{buildroot}/%{_sysconfdir}/%{platform}/%{component}
install -m 644 %{SOURCE3} %{buildroot}/%{_sysconfdir}/%{platform}/%{component}

# /etc/openmooc/askbot/instances
install -d -m 755 %{buildroot}/%{_sysconfdir}/%{platform}/%{component}/instances

# /etc/openmooc/askbot/certs
install -d -m 755 %{buildroot}/%{_sysconfdir}/%{platform}/%{component}/certs/
install -m 440 %{SOURCE4} %{buildroot}/%{_sysconfdir}/%{platform}/%{component}/certs/
install -m 440 %{SOURCE5} %{buildroot}/%{_sysconfdir}/%{platform}/%{component}/certs/

# /usr/libexexec/openmooc
install -d -m 755 %{buildroot}/%{_libexecdir}/%{platform}
install -m 755 %{SOURCE1} %{buildroot}/%{_libexecdir}/%{platform}

# /var/lib/askbot-openmooc
install -d -m 755 %{buildroot}/%{_sharedstatedir}/%{name}

# /var/lib/askbot-openmooc/instances
install -d -m 755 %{buildroot}/%{_sharedstatedir}/%{name}/instances

# /var/run/openmooc [wsgi/apache sockets]
install -d -m 770 %{_var}/run/openmooc

# apache conf
install -d -m 755 %{buildroot}/%{_sysconfdir}/httpd/conf.d
install -m 755 %{SOURCE2} %{buildroot}/%{_sysconfdir}/httpd/conf.d/%{name}.conf

# xmlsec1 link

install -d -m 755 %{buildroot}/usr/lib64
ln -s /usr/lib64/libxmlsec1-openssl.so.1 %{buildroot}%{_prefix}/lib64/libxmlsec1-openssl.so


%clean
rm -rf $RPM_BUILD_ROOT

%files
%defattr(-,root,root)

%doc docs/ README.rst COPYING

%dir %{_defaultdocdir}/
%dir %{_sysconfdir}/%{platform}
%dir %{_sysconfdir}/%{platform}/%{component}
%dir %{_sysconfdir}/%{platform}/%{component}/instances
%dir %{_sysconfdir}/%{platform}/%{component}/certs
%dir %{_libexecdir}/%{platform}
%dir %{_sharedstatedir}/%{name}
%dir %{_sharedstatedir}/%{name}/instances

%dir %{_prefix}/lib64/

%{_prefix}/lib64/libxmlsec1-openssl.so


%config(noreplace) %{_sysconfdir}/%{platform}/%{component}/certs/server.key
%config(noreplace) %{_sysconfdir}/%{platform}/%{component}/certs/server.crt
%config(noreplace) %{_sysconfdir}/%{platform}/%{component}/local_settings.py*

%config(noreplace) %{_sysconfdir}/httpd/conf.d/%{name}.conf

%{_libexecdir}/%{platform}/askbot-openmooc.wsgi

%dir %{python_sitelib}/%{libname}/
%dir %{python_sitelib}/%{libname}/askbotopenmoocapp
%dir %{python_sitelib}/%{libname}/askbotopenmoocapp/management
%dir %{python_sitelib}/%{libname}/askbotopenmoocapp/management/commands
%dir %{python_sitelib}/%{libname}/askbotopenmoocapp/migrations
%dir %{python_sitelib}/%{libname}/askbotopenmoocapp/templates
%dir %{python_sitelib}/%{libname}/askbotopenmoocapp/templates/mooc
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/media
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/media/images
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/media/bootstrap/css
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/media/style
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/templates
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/templates/widgets
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/templates/meta
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/templates/question
%dir %{python_sitelib}/%{libname}/admin-templates
%dir %{python_sitelib}/%{libname}/admin-templates/admin
%dir %{python_sitelib}/%{libname}/locale/en/LC_MESSAGES/
%dir %{python_sitelib}/%{libname}/locale/es/LC_MESSAGES/
%dir %{python_sitelib}/%{libname}/saml2
%dir %{python_sitelib}/%{libname}/saml2/attribute-maps

%dir %{python_sitelib}/askbot_%{platform}-%{version}-*.egg-info/

%{python_sitelib}/%{libname}/*.py*
%{python_sitelib}/%{libname}/askbotopenmoocapp/*.py*
%{python_sitelib}/%{libname}/askbotopenmoocapp/management/*.py*
%{python_sitelib}/%{libname}/askbotopenmoocapp/management/commands/*.py*
%{python_sitelib}/%{libname}/askbotopenmoocapp/migrations/*.py*
%{python_sitelib}/%{libname}/askbotopenmoocapp/templates/mooc/*.html
%{python_sitelib}/%{libname}/admin-templates/admin/*.html
%{python_sitelib}/%{libname}/saml2/attribute-maps/*py*

%{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/media/images/*
%{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/media/bootstrap/css/bootstrap.css
%{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/media/style/*.css
%{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/templates/widgets/*.html
%{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/templates/meta/*.html
%{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/templates/question/*.html

%{python_sitelib}/%{libname}/locale/en/LC_MESSAGES/*
%{python_sitelib}/%{libname}/locale/es/LC_MESSAGES/*

%{python_sitelib}/askbot_%{platform}-%{version}-*.egg-info/*
